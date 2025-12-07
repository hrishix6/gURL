package main

import (
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/linux"
)

//go:embed all:frontend/dist/gurl/browser
var assets embed.FS

func main() {
	// Create an instance of the app structure
	gurl := NewGurl()

	// Create application with options
	err := wails.Run(&options.App{
		Title: "gURL",
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        gurl.startup,
		WindowStartState: options.Maximised,
		MinWidth:         667,
		MinHeight:        1000,
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
