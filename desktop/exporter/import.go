package exporter

import (
	"os"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func (ex *DesktopExporter) ImportCollection(workspaceId string) error {

	//open save file dialogue and perform io.copy
	dialogueOptions := runtime.OpenDialogOptions{
		Title: "Choose collection file to import",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "JSON (*.json)",
				Pattern:     "*.json",
			},
		},
	}

	if dir, err := os.UserHomeDir(); err == nil {
		dialogueOptions.DefaultDirectory = dir
	}

	src, err := runtime.OpenFileDialog(ex.appCtx, dialogueOptions)

	if err != nil {
		return err
	}

	return ex.internalImportor.HandleImportCollection(ex.appCtx, src, workspaceId)
}

func (ex *DesktopExporter) ImportEnvironment(workspaceId string) error {
	//open save file dialogue and perform io.copy
	dialogueOptions := runtime.OpenDialogOptions{
		Title: "Choose environment file to import",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "JSON (*.json)",
				Pattern:     "*.json",
			},
		},
	}

	if dir, err := os.UserHomeDir(); err == nil {
		dialogueOptions.DefaultDirectory = dir
	}

	src, err := runtime.OpenFileDialog(ex.appCtx, dialogueOptions)

	if err != nil {
		return err
	}

	return ex.internalImportor.HandleImportEnvironment(ex.appCtx, src, workspaceId)
}
