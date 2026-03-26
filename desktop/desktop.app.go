package desktop

import (
	"context"
	"fmt"
	"gurl/desktop/executor"
	"gurl/desktop/exporter"
	"gurl/desktop/storage"
	"gurl/internal"
	"gurl/internal/assets"
	"gurl/internal/models"
	"log"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/linux"
)

func InitializeDesktopApp(
	params models.AppInitParams,
) {

	//bounded structs
	storageInstance := storage.NewStorage(params.Db, params.SavedResponsesDir)

	executorInstance := executor.NewExecutor(
		params.Db,
		params.AppName,
		params.TempDir,
		params.SavedResponsesDir)

	exporterInstance := exporter.NewExporter(params.Db)

	err := wails.Run(&options.App{
		Title: fmt.Sprintf("%s %s", internal.APP_NAME, internal.VERSION),
		AssetServer: &assetserver.Options{
			Assets: assets.Assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup: func(ctx context.Context) {
			err := storage.Startup(&storageInstance, ctx)

			if err != nil {
				log.Fatalf("unable to initialize storage %v", err)
			}

			err = executor.Startup(&executorInstance, ctx, assets.MimedbJson)

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
