package main

import (
	"context"
	"errors"
	"fmt"
	"gurl/shared/assets"
	"gurl/web/api"
	"gurl/web/auth"
	clientconfig "gurl/web/client_config"
	"gurl/web/executor"
	"gurl/web/exporter"
	"gurl/web/internal"
	"gurl/web/internal/config"
	"gurl/web/internal/emailx"
	"gurl/web/storage"
	"io/fs"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path"
	"path/filepath"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/go-co-op/gocron/v2"

	"gorm.io/gorm"
)

func withCORS(next http.Handler, frontendURL, backendURL string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		origin := r.Header.Get("Origin")

		if strings.HasPrefix(origin, "http://localhost") || origin == frontendURL || origin == backendURL {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
		}

		w.Header().Set("Access-Control-Allow-Methods", "GET,OPTIONS,HEAD,POST,PUT,PATCH,DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Authorization,Content-Type")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func InitializeWebApp(
	appCfg *config.WebApplicationConfig,
	dbConn *gorm.DB,
) {

	var cleanupWG sync.WaitGroup

	mailer := emailx.NewMailer(appCfg.EmailConfig)
	webStorage := storage.NewWebStorage(dbConn, appCfg.BaseSavedResponsesDir)
	webExecutor := executor.NewWebExecutor(appCfg, webStorage)
	webExporter := exporter.NewWebExporter(dbConn, appCfg.BaseUploadsDir)
	authSvc := auth.NewAuthService(appCfg, webStorage, webExporter, mailer)

	ctx := context.Background()

	srvAddr := fmt.Sprintf(":%d", appCfg.Port)

	if appCfg.BackendURL == "" {
		appCfg.BackendURL = fmt.Sprintf("http://localhost:%d", appCfg.Port)
	}

	if appCfg.FrontendURL == "" {
		appCfg.FrontendURL = appCfg.BackendURL
	}

	previewSrvAddr := fmt.Sprintf("%s/preview", appCfg.FrontendURL)

	err := webStorage.Startup(ctx)

	if err != nil {
		log.Fatalf("unable to initialize storage %v", err)
	}

	err = webExecutor.Startup(ctx, assets.MimedbJson, previewSrvAddr)

	if err != nil {
		log.Fatalf("unable to initialize executor %v", err)
	}

	apiRouter := api.NewApi(appCfg, webStorage, webExecutor, webExporter, authSvc)
	authRouter := auth.NewAuthRouter(appCfg, authSvc)

	mux := http.NewServeMux()

	appConfigRouter := clientconfig.NewClientConfigController(
		internal.VERSION,
		appCfg.AuthConfig.EnableDemo,
		webStorage,
	)

	mux.Handle("/config.json", appConfigRouter.Routes())

	mux.Handle("/auth/", http.StripPrefix("/auth", authRouter.Routes()))

	mux.Handle("/api/v1/", http.StripPrefix("/api/v1", apiRouter.Routes()))

	previewHandler := webExecutor.GetPreviewHandler()

	mux.Handle("/preview/{id}/", apiRouter.ProtectedRoute(apiRouter.PreviewHandler(previewHandler)))

	if appCfg.Env == "PROD" {
		subFs, err := fs.Sub(assets.Assets, filepath.Join("static", "browser"))

		if err != nil {
			log.Fatalf("unable to get sub filesystem: %v", err)
		}

		webAssetServer := http.FileServer(http.FS(subFs))

		mux.Handle("/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			_, err := subFs.Open(strings.TrimPrefix(path.Clean(r.URL.Path), "/"))
			if err != nil {
				log.Println("didn't find file serving index.html")
				r.URL.Path = "/"
			}
			webAssetServer.ServeHTTP(w, r)
		}))
	}

	srv := &http.Server{
		Addr:    srvAddr,
		Handler: withCORS(mux, appCfg.FrontendURL, appCfg.BackendURL),
	}

	//cron
	s, err := gocron.NewScheduler()

	if err != nil {
		log.Fatalln("failed to schedule cron jobs")
	}

	j, err := s.NewJob(
		gocron.DurationJob(10*time.Minute),
		gocron.NewTask(func(svc *auth.AuthService) {
			log.Printf("[CronJob]: Clean up job started")

			err := svc.CleanupDemoUsers()

			if err != nil {
				log.Printf("[CronJob]: clean up job failed %v\n", err)
			}

			log.Printf("[CronJob]: clean up job ended")

		}, authSvc),
	)

	if err != nil {
		log.Fatalln("failed to start cleanup job")
	}

	log.Printf("Job #%s demo user cleanup scheduled for every 10 min\n", j.ID())

	s.Start()

	cleanupWG.Add(1)

	go func() {
		defer cleanupWG.Done()

		if err := srv.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("Serve(): %v", err)
		}

		webStorage.Shutdown()
		webExecutor.Shutdown()
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

	err = s.Shutdown()

	if err != nil {
		log.Println("failed to shutdown cron scheduler")
	}

	cleanupWG.Wait()
}
