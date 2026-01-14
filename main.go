package main

import (
	"context"
	"embed"
	"fmt"
	"gurl/executor"
	"gurl/internal"
	"gurl/internal/db"
	"gurl/internal/utils"
	"gurl/storage"
	"log"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/linux"
)

//go:embed all:frontend/dist/gurl/browser
var assets embed.FS

//go:embed all:frontend/dist/gurl/browser/mime.db.json
var mimedbJson []byte

func main() {

	env, ok := os.LookupEnv("ENV")

	if !ok {
		env = "PROD"
	}

	var appName string
	version, ok := os.LookupEnv("VERSION")
	if !ok {
		appName = internal.APP_NAME
	} else {
		appName = fmt.Sprintf("%s_%s", internal.APP_NAME, version)
	}

	var dsn string

	log.Printf("[Gurl] env is %s\n", env)

	tmpDir, err := utils.InitTempDir(appName)

	if err != nil {
		log.Fatalf("unable to initialize temp directory : %v", err)
	}

	log.Printf("[Gurl] tmp location: %s \n", tmpDir)

	if env == "PROD" {
		dataDir, err := utils.InitDataDir(appName)

		if err != nil {
			log.Fatalf("unable to initialize user data directory %v", err)
		}

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
	storageInstance := storage.NewStorage(dbConn)
	executorInstance := executor.NewExecutor(dbConn, appName, tmpDir)

	// Create application with options
	err = wails.Run(&options.App{
		Title: "gURL v0.4.0",
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
		},
		OnBeforeClose: func(ctx context.Context) (prevent bool) {
			storage.Shutdown(&storageInstance)
			executor.Shutdown(&executorInstance, ctx)

			return false
		},
		WindowStartState: options.Maximised,
		MinWidth:         667,
		MinHeight:        1280,
		DisableResize:    false,
		Bind: []interface{}{
			&storageInstance,
			&executorInstance,
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
