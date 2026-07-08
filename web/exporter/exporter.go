package exporter

import (
	"context"
	"encoding/json"
	importexport "gurl/shared/import_export"
	"gurl/shared/models"

	"gorm.io/gorm"
)

type WebExporter struct {
	exporter *importexport.InternalExporter
	importer *importexport.InternalImporter
}

func NewWebExporter(db *gorm.DB) *WebExporter {
	return &WebExporter{
		exporter: importexport.NewInternalExporter(db),
		importer: importexport.NewInternalImporter(db),
	}
}

func (wx *WebExporter) ExportCollection(ctx context.Context, id string) (string, []byte, error) {

	exportedCollection, err := wx.exporter.ExportCollection(ctx, id)

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
	exportedEnv, err := wx.exporter.ExportEnvironment(ctx, id)

	if err != nil {
		return "", nil, err
	}

	b, err := json.Marshal(exportedEnv)

	if err != nil {
		return "", nil, err
	}

	return exportedEnv.Name, b, nil
}

func (wx *WebExporter) ImportCollection(ctx context.Context, dto models.WebImportDTO) (string, error) {
	return wx.importer.HandleImportCollection(ctx, dto.Filepath, dto.WorkspaceId)
}

func (wx *WebExporter) ImportEnvironment(ctx context.Context, dto models.WebImportDTO) (string, error) {
	return wx.importer.HandleImportEnvironment(ctx, dto.Filepath, dto.WorkspaceId)
}
