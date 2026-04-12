package exporter

import (
	"context"
	"encoding/json"
	importexport "gurl/shared/import_export"
	"gurl/shared/models"
	"path/filepath"

	"gorm.io/gorm"
)

type WebExporter struct {
	uploadsDir string
	_exporter  *importexport.InternalExporter
	_importer  *importexport.InternalImporter
}

func NewWebExporter(db *gorm.DB, uploadsDir string) *WebExporter {
	return &WebExporter{
		uploadsDir: uploadsDir,
		_exporter:  importexport.NewInternalExporter(db),
		_importer:  importexport.NewInternalImporter(db),
	}
}

func (wx *WebExporter) ExportCollection(ctx context.Context, id string) (string, []byte, error) {

	exportedCollection, err := wx._exporter.ExportCollection(ctx, id)

	if err != nil {
		return "", nil, err
	}

	b, err := json.Marshal(exportedCollection)

	if err != nil {
		return "", nil, err
	}

	return exportedCollection.Name, b, nil
}

func (wx *WebExporter) ExportEnvironment(ctx context.Context, id string) (string, []byte, error) {
	exportedEnv, err := wx._exporter.ExportEnvironment(ctx, id)

	if err != nil {
		return "", nil, err
	}

	b, err := json.Marshal(exportedEnv)

	if err != nil {
		return "", nil, err
	}

	return exportedEnv.Name, b, nil
}

func (wx *WebExporter) ImportCollection(ctx context.Context, dto models.WebImportDTO) error {
	//In Web client Filepath is only file name, this is by design to not expose file system to web client side
	//frontend will only pass temp file name that was uploaded, we append temp uploads directory path before passing it to importer.
	dto.Filepath = filepath.Join(wx.uploadsDir, dto.Filepath)

	_, err := wx._importer.HandleImportCollection(ctx, dto.Filepath, dto.WorkspaceId)

	return err
}

func (wx *WebExporter) ImportEnvironment(ctx context.Context, dto models.WebImportDTO) error {
	dto.Filepath = filepath.Join(wx.uploadsDir, dto.Filepath)
	_, err := wx._importer.HandleImportEnvironment(ctx, dto.Filepath, dto.WorkspaceId)

	return err
}

func (wx *WebExporter) ImportDemoCollection(ctx context.Context, dto models.WebImportDTO) (string, error) {
	return wx._importer.HandleImportCollection(ctx, dto.Filepath, dto.WorkspaceId)
}

func (wx *WebExporter) ImportDemoEnvironment(ctx context.Context, dto models.WebImportDTO) (string, error) {
	return wx._importer.HandleImportEnvironment(ctx, dto.Filepath, dto.WorkspaceId)
}
