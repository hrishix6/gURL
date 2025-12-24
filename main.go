package main

import (
	"embed"
	"fmt"
	"gurl/internal"
	"gurl/internal/db"
	"gurl/internal/utils"
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

	//initialize Database connection
	env, ok := os.LookupEnv("ENV")

	if !ok {
		env = "DEV"
	}

	var appName string
	version, ok := os.LookupEnv("VERSION")
	if !ok {
		appName = internal.APP_NAME
		version = ""
	} else {
		appName = fmt.Sprintf("%s_%s", internal.APP_NAME, version)
	}

	var dsn string

	fmt.Printf("env is %s", env)

	if env == "PROD" {
		dataDir, err := utils.InitDataDir(appName)

		if err != nil {
			panic(err)
		}

		dsn = filepath.Join(dataDir, db.DB_NAME)
	} else {
		dsn = db.DB_NAME
	}

	//initialize DB connection
	dbConn, err := db.InitDb(dsn)

	if err != nil {
		panic(err)
	}

	gurl := NewGurl(dbConn, version)

	// Create application with options
	err = wails.Run(&options.App{
		Title: "gURL",
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        gurl.startup,
		OnBeforeClose:    gurl.shutdown,
		WindowStartState: options.Maximised,
		MinWidth:         667,
		MinHeight:        1280,
		DisableResize:    false,
		Bind: []interface{}{
			gurl,
		},
		Linux: &linux.Options{
			WebviewGpuPolicy:    linux.WebviewGpuPolicyAlways,
			WindowIsTranslucent: true,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
