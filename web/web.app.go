package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"gurl/shared/assets"
	"gurl/shared/models"
	"gurl/web/api"
	"gurl/web/executor"
	"gurl/web/exporter"
	"gurl/web/internal"
	"gurl/web/storage"
	"io/fs"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"sync"
	"syscall"

	"gorm.io/gorm"
)

type GurlWebApp struct {
	storage   *storage.WebStorage
	executor  *executor.WebExecutor
	exporter  *exporter.WebExporter
	cleanupWG *sync.WaitGroup
}

func NewGurlWebApp(
	appName string,
	db *gorm.DB,
	savedResDir string,
	tmpDir string,
	webTmpDir string,
) *GurlWebApp {
	return &GurlWebApp{
		storage:   storage.NewWebStorage(db, savedResDir),
		executor:  executor.NewWebExecutor(db, appName, tmpDir, savedResDir, webTmpDir),
		exporter:  exporter.NewWebExporter(db),
		cleanupWG: &sync.WaitGroup{},
	}
}

func withCORS(next http.Handler, gurlUrl string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		origin := r.Header.Get("Origin")

		log.Printf("[Web/CORS]: requesting origin %s\n", origin)

		if strings.HasPrefix(origin, "http://localhost") || origin == gurlUrl {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
		}

		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS, HEAD")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func InitializeWebApp(
	params models.WebAppInitParams,
) {

	webApp := NewGurlWebApp(
		params.AppName,
		params.Db,
		params.SavedResponsesDir,
		params.TempDir,
		params.WebTempDir,
	)

	ctx := context.Background()

	srvAddr := fmt.Sprintf(":%d", params.Port)

	baseUrl := ""

	if params.BaseURL != "" {
		baseUrl = params.BaseURL
	} else {
		baseUrl = fmt.Sprintf("http://localhost:%d", params.Port)
	}

	previewSrvAddr := fmt.Sprintf("%s/preview", baseUrl)

	err := webApp.storage.Startup(ctx)

	if err != nil {
		log.Fatalf("unable to initialize storage %v", err)
	}

	err = webApp.executor.Startup(ctx, assets.MimedbJson, previewSrvAddr)

	if err != nil {
		log.Fatalf("unable to initialize executor %v", err)
	}

	api := api.NewApi(webApp.storage, webApp.executor, webApp.exporter)

	apiHandler := api.Routes()

	mux := http.NewServeMux()

	mux.Handle("/api/v1/", http.StripPrefix("/api/v1", apiHandler))

	subFs, err := fs.Sub(assets.Assets, filepath.Join("static", "browser"))

	if err != nil {
		log.Fatalf("unable to get sub filesystem: %v", err)
	}

	webAssetServer := http.FileServer(http.FS(subFs))

	webAppConfig := models.GurlClientConfig{
		Mode:       "web",
		BackendURL: "/api/v1",
		AppVersion: internal.VERSION,
	}

	//intercepts calls to config.json and serves web app config, by default config.json in build is for desktop mode
	mux.HandleFunc("/config.json", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(webAppConfig)
	})

	previewHandler := webApp.executor.GetPreviewHandler()

	mux.Handle("/preview/", http.StripPrefix("/preview", previewHandler))

	mux.Handle("/", webAssetServer)

	srv := &http.Server{
		Addr:    srvAddr,
		Handler: withCORS(mux, baseUrl),
	}

	webApp.cleanupWG.Add(1)

	go func() {
		defer webApp.cleanupWG.Done()

		if err := srv.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("Serve(): %v", err)
		}

		webApp.storage.Shutdown()
		webApp.executor.Shutdown()
		log.Println(`[WebApp] Server Shutdown finished`)
	}()

	log.Printf("[WebApp] Server Started Listening at %s", srv.Addr)

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("[WebApp] Received SIGTERM/SIGINT, Force Shutting down server...")

	if err := srv.Shutdown(context.Background()); err != nil {
		log.Printf("[WebApp] Server forced to shutdown: %v", err)
	}

	webApp.cleanupWG.Wait()
}
