package exporter

import (
	"context"
	"encoding/json"
	"gurl/internal"
	"gurl/internal/db"
	"gurl/internal/models"
	"log"
	"os"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Exporter struct {
	db     *gorm.DB
	appCtx context.Context
	tmpDir string
}

func NewExporter(db *gorm.DB, tmpDir string) Exporter {
	return Exporter{
		db:     db,
		tmpDir: tmpDir,
	}
}

func Startup(ex *Exporter, appCtx context.Context) error {
	ex.appCtx = appCtx
	return nil
}

func ShutDown(ex *Exporter) {

}

func toExportedMultipartItem(input datatypes.JSON) []models.ExportedMultipartItem {

	var o []models.MultipartKeyValItem

	err := json.Unmarshal(input, &o)

	if err != nil {
		log.Printf("failed to unmarshal item %v", err)
		return []models.ExportedMultipartItem{}
	}

	var results []models.ExportedMultipartItem

	for _, item := range o {

		if r, ok := item.ValAsStr(); ok {
			results = append(results, models.ExportedMultipartItem{
				K:      item.Key,
				V:      r,
				IsFile: false,
			})

			continue
		}

		if r, ok := item.ValAsFileStats(); ok {
			results = append(results, models.ExportedMultipartItem{
				K:      item.Key,
				V:      r.Path,
				IsFile: true,
			})
		}
	}

	return results
}

func toExportedBinaryBody(input datatypes.JSON) string {
	var o models.FileStats

	if err := json.Unmarshal(input, &o); err == nil {
		return o.Path
	}

	return ""
}

func toExportedKeyValItem(input datatypes.JSON) []models.ExportedKeyValItem {
	var o []models.KeyValItem

	err := json.Unmarshal(input, &o)

	if err != nil {
		log.Printf("error unmarshalling keyvalitem %v", err)
		return []models.ExportedKeyValItem{}
	}

	var result []models.ExportedKeyValItem

	for _, item := range o {
		result = append(result, models.ExportedKeyValItem{
			K: item.Key,
			V: item.Val,
		})
	}

	return result
}

func toExportedBasicAuth(input datatypes.JSON) (*models.BasicAuth, bool) {
	var o models.BasicAuth

	if err := json.Unmarshal(input, &o); err == nil {
		return &o, true
	}

	return nil, false
}

func toExportedApiKeyAuth(input datatypes.JSON) (*models.ApiKeyAuth, bool) {
	var o models.ApiKeyAuth

	if err := json.Unmarshal(input, &o); err == nil {
		return &o, true
	}

	return nil, false
}

func toExportedTokenAuth(input datatypes.JSON) (*models.TokenAuth, bool) {
	var o models.TokenAuth

	if err := json.Unmarshal(input, &o); err == nil {
		return &o, true
	}

	return nil, false
}

func toExportedRequest(input db.Request) models.ExportedGurlReq {

	var o = models.ExportedGurlReq{
		Version:        internal.SCHEMA_VERSION,
		Name:           input.Name,
		Url:            input.Url,
		Method:         input.Method,
		Headers:        toExportedKeyValItem(input.Headers),
		QueryParams:    toExportedKeyValItem(input.Query),
		Cookies:        toExportedKeyValItem(input.Cookies),
		BodyType:       models.ValidateOrDefaultBodyType(input.BodyType, models.NoBodyType),
		UrlEncodedBody: toExportedKeyValItem(input.UrlEncodedForm),
		MultipartBody:  toExportedMultipartItem(input.MultipartForm),
		TextBody:       input.TextBody,
		BinaryBody:     toExportedBinaryBody(input.BinaryBody),
		AuthType:       models.GurlAuthType(input.AuthType),
	}

	if r, ok := toExportedBasicAuth(input.BasicAuth); ok {
		o.BasicAuth = *r
	}

	if r, ok := toExportedApiKeyAuth(input.ApiKeyAuth); ok {
		o.ApiKeyAuth = *r
	}

	if r, ok := toExportedTokenAuth(input.TokenAuth); ok {
		o.TokenAuth = *r
	}

	return o
}

func (ex *Exporter) _exportCollection(collectionId string) (*models.ExportedGurlCollection, error) {

	collection, err := gorm.G[db.Collection](ex.db).Where("id = ?", collectionId).First(ex.appCtx)

	if err != nil {
		return nil, err
	}

	requests, err := gorm.G[db.Request](ex.db).Where("collection_id = ?", collection.Id).Order("created desc").Find(ex.appCtx)

	if err != nil {
		return nil, err
	}

	var ec = &models.ExportedGurlCollection{
		Version: internal.SCHEMA_VERSION,
		Name:    collection.Name,
	}

	for _, req := range requests {
		ec.Requests = append(ec.Requests, toExportedRequest(req))
	}

	return ec, nil
}

func (ex *Exporter) ExportCollection(id string) error {

	exportedCollection, err := ex._exportCollection(id)

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

func (ex *Exporter) _exportEnvironment(id string) (*models.ExportedEnvironment, error) {
	env, err := gorm.G[db.Environment](ex.db).Where("id = ?", id).First(ex.appCtx)

	if err != nil {
		return nil, err
	}

	var data []models.UIEnvironmentItem

	err = json.Unmarshal(env.Data, &data)

	if err != nil {
		return nil, err
	}

	var exportedEnv = &models.ExportedEnvironment{
		Version: internal.SCHEMA_VERSION,
		Name:    env.Name,
		Vars:    []models.ExportedEnvironmentItem{},
	}

	for _, item := range data {
		exportedEnv.Vars = append(exportedEnv.Vars, models.ExportedEnvironmentItem{
			K:           item.Key,
			V:           item.Value,
			IsSecret:    item.IsSecret,
			Description: item.Description,
		})
	}

	return exportedEnv, nil
}

func (ex *Exporter) ExportEnvironment(id string) error {
	exportedEnv, err := ex._exportEnvironment(id)

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
