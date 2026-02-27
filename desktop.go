package main

import (
	"context"
	"fmt"
	"gurl/executor"
	"gurl/exporter"
	"gurl/internal"
	"gurl/internal/db"
	"gurl/internal/utils"
	"gurl/storage"
	"log"
	"path/filepath"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/linux"
)

func initializeDesktopApp(env string) {
	appName := fmt.Sprintf("%s_%s", internal.APP_NAME, internal.VERSION)

	var dsn string

	log.Printf("[Gurl] env is %s\n", env)

	tmpDir, err := utils.InitTempDir(appName)

	if err != nil {
		log.Fatalf("unable to initialize temp directory : %v", err)
	}

	log.Printf("[Gurl] tmp location: %s \n", tmpDir)

	dataDir, err := utils.InitDataDir(appName)

	if err != nil {
		log.Fatalf("unable to initialize data directory : %v", err)
	}

	log.Printf("[Gurl] data location: %s \n", dataDir)

	savedResponsesDir, err := utils.InitSavedResponsesDir(dataDir, internal.SAVED_RESPONSES_LOCATION)

	if err != nil {
		log.Fatalf("unable to initialize saved responses directory : %v", err)
	}

	log.Printf("[Gurl] saved responses location: %s \n", savedResponsesDir)

	if env == "PROD" {
		dsn = filepath.Join(dataDir, db.DB_NAME)
	} else {
		dsn = db.DB_NAME
	}

	log.Printf("[Gurl] database connection string - %s\n", dsn)

	//initialize DB connection
	dbConn, err := db.InitDb(dsn)

	if err != nil {
		log.Fatalf("unable to establish sqlite connection %v", err)
	}

	log.Println("[Gurl] Db connection established")

	//bounded structs
	storageInstance := storage.NewStorage(dbConn, savedResponsesDir)
	executorInstance := executor.NewExecutor(dbConn, appName, tmpDir, savedResponsesDir)
	exporterInstance := exporter.NewExporter(dbConn, tmpDir)

	// Create application with options
	err = wails.Run(&options.App{
		Title: fmt.Sprintf("%s %s", internal.APP_NAME, internal.VERSION),
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup: func(ctx context.Context) {
			err := storage.Startup(&storageInstance, ctx)

			if err != nil {
				log.Fatalf("unable to initialize storage %v", err)
			}

			err = executor.Startup(&executorInstance, ctx, mimedbJson)

			if err != nil {
				log.Fatalf("unable to initialize executor %v", err)
			}

			err = exporter.Startup(&exporterInstance, ctx)

			if err != nil {
				log.Fatalf("unable to initialize exporter %v", err)
			}
		},
		OnBeforeClose: func(ctx context.Context) (prevent bool) {
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
