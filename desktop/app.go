package main

import (
	"context"
	"encoding/json"
	"fmt"
	"gurl/desktop/executor"
	"gurl/desktop/exporter"
	"gurl/desktop/internal"
	"gurl/desktop/storage"
	"gurl/shared/assets"
	mockserver "gurl/shared/mock-server"
	"gurl/shared/models"
	"log"
	"net/http"
	"strings"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/linux"
)

func InitializeDesktopApp(
	params models.AppInitParams,
) {

	//bounded structs
	storageInstance := storage.NewStorage(params.Db, params.TempDir, params.SavedResponsesDir)

	executorInstance := executor.NewExecutor(
		params.Db,
		params.AppName,
		params.TempDir,
		params.SavedResponsesDir)

	exporterInstance := exporter.NewExporter(params.Db)

	server := internal.NewHttpServer()

	mockSrv := mockserver.NewMockServer(params.Db)

	err := wails.Run(&options.App{
		Title: fmt.Sprintf("%s %s", internal.APP_NAME, internal.VERSION),
		AssetServer: &assetserver.Options{
			Assets: assets.Assets,
			Handler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				requestedFilename := strings.TrimPrefix(r.URL.Path, "/")
				if requestedFilename == "config.json" {

					desktopConfig := models.GurlClientConfig{
						Mode:           "desktop",
						ApiBaseURL:     "",
						AuthBaseURL:    "",
						AppVersion:     internal.VERSION,
						SetupRequired:  false,
						DemoEnabled:    false,
						Env:            params.Env,
						MockSrvBaseURL: fmt.Sprintf(`http://localhost:%d/mocksvc`, internal.SERVER_PORT),
					}

					w.WriteHeader(http.StatusOK)
					json.NewEncoder(w).Encode(desktopConfig)
					return
				}

				http.NotFound(w, r)
			}),
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup: func(ctx context.Context) {
			mux := http.NewServeMux()

			destktopUserCtx, err := storage.Startup(&storageInstance, ctx)

			if err != nil {
				log.Fatalf("unable to initialize storage %v", err)
			}

			err = executor.Startup(&executorInstance, destktopUserCtx, assets.MimedbJson, mux)

			if err != nil {
				log.Fatalf("unable to initialize executor %v", err)
			}

			err = exporter.Startup(&exporterInstance, destktopUserCtx)

			if err != nil {
				log.Fatalf("unable to initialize exporter %v", err)
			}

			mux.Handle("/mocksvc/{id}/", http.StripPrefix("/mocksvc/", mockserver.MockServerCORS(mockSrv.CollectionChecksHandler(mockSrv.MockHandler))))

			err = server.Startup(mux)

			if err != nil {
				log.Fatalf("unable to initialize http server %v", err)
			}

		},
		OnBeforeClose: func(ctx context.Context) (prevent bool) {
			server.Shutdown(ctx)
			storage.Shutdown(&storageInstance)
			executor.Shutdown(&executorInstance, ctx)
			exporter.ShutDown(&exporterInstance)
			return false
		},
		WindowStartState: options.Maximised,
		MinWidth:         667,
		MinHeight:        1028,
		DisableResize:    false,
		Bind: []interface{}{
			&storageInstance,
			&executorInstance,
			&exporterInstance,
		},
		Linux: &linux.Options{
			WebviewGpuPolicy:    linux.WebviewGpuPolicyAlways,
			WindowIsTranslucent: true,
		},
	})

	if err != nil {
		log.Fatalf("unable to start app %v", err)
	}
}
