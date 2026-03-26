package exporter

import (
	"context"
	"encoding/json"
	importexport "gurl/internal/import_export"
	"os"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"gorm.io/gorm"
)

type DesktopExporter struct {
	internalExportor *importexport.InternalExporter
	internalImportor *importexport.InternalImporter
	appCtx           context.Context
}

func NewExporter(db *gorm.DB) DesktopExporter {
	return DesktopExporter{
		internalExportor: importexport.NewInternalExporter(db),
		internalImportor: importexport.NewInternalImporter(db),
	}
}

func Startup(ex *DesktopExporter, appCtx context.Context) error {
	ex.appCtx = appCtx
	return nil
}

func ShutDown(ex *DesktopExporter) {
	//import-export related cleanup
}

func (ex *DesktopExporter) ExportCollection(id string) error {

	exportedCollection, err := ex.internalExportor.ExportCollection(ex.appCtx, id)

	if err != nil {
		return err
	}

	//open save file dialogue and perform io.copy
	dialogueOptions := runtime.SaveDialogOptions{
		Title:           "Choose location to store response",
		DefaultFilename: "gurl.collection.json",
	}

	if dir, err := os.UserHomeDir(); err == nil {
		dialogueOptions.DefaultDirectory = dir
	}

	dst, err := runtime.SaveFileDialog(ex.appCtx, dialogueOptions)

	if err != nil {
		return err
	}

	dstF, err := os.Create(dst)

	if err != nil {
		return err
	}

	defer dstF.Close()

	err = json.NewEncoder(dstF).Encode(exportedCollection)

	if err != nil {
		return err
	}

	return nil
}

func (ex *DesktopExporter) ExportEnvironment(id string) error {
	exportedEnv, err := ex.internalExportor.ExportEnvironment(ex.appCtx, id)

	if err != nil {
		return err
	}

	//open save file dialogue and perform io.copy
	dialogueOptions := runtime.SaveDialogOptions{
		Title:           "Choose location to store environment",
		DefaultFilename: "gurl.environment.json",
	}

	if dir, err := os.UserHomeDir(); err == nil {
		dialogueOptions.DefaultDirectory = dir
	}

	dst, err := runtime.SaveFileDialog(ex.appCtx, dialogueOptions)

	if err != nil {
		return err
	}

	dstF, err := os.Create(dst)

	if err != nil {
		return err
	}

	defer dstF.Close()

	err = json.NewEncoder(dstF).Encode(exportedEnv)

	if err != nil {
		return err
	}

	return nil
}
