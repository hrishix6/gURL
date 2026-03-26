package exporter

import (
	"context"
	"encoding/json"
	importexport "gurl/internal/import_export"
	"gurl/internal/models"

	"gorm.io/gorm"
)

type WebExporter struct {
	_exporter *importexport.InternalExporter
	_importer *importexport.InternalImporter
}

func NewWebExporter(db *gorm.DB) *WebExporter {
	return &WebExporter{
		_exporter: importexport.NewInternalExporter(db),
		_importer: importexport.NewInternalImporter(db),
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
	return wx._importer.HandleImportCollection(ctx, dto.Filepath, dto.WorkspaceId)
}

func (wx *WebExporter) ImportEnvironment(ctx context.Context, dto models.WebImportDTO) error {
	return wx._importer.HandleImportEnvironment(ctx, dto.Filepath, dto.WorkspaceId)
}
