package importexport

import (
	"context"
	"encoding/json"
	"gurl/internal"
	dbPkg "gurl/internal/db"
	"gurl/internal/models"
	"log"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type InternalExporter struct {
	collectionRepo *dbPkg.CollectionRepository
	reqRepo        *dbPkg.RequestRepository
	envRepo        *dbPkg.EnvironmentRepository
}

func NewInternalExporter(db *gorm.DB) *InternalExporter {
	return &InternalExporter{
		collectionRepo: dbPkg.NewCollectionRepository(db),
		reqRepo:        dbPkg.NewRequestRepository(db),
		envRepo:        dbPkg.NewEnvironmentRepository(db),
	}
}

func ToExportedMultipartItem(input datatypes.JSON) []models.ExportedMultipartItem {

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

func ToExportedBinaryBody(input datatypes.JSON) string {
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

func toExportedRequest(input dbPkg.Request) models.ExportedGurlReq {

	var multipartItems []models.ExportedMultipartItem

	for _, mi := range ToExportedMultipartItem(input.MultipartForm) {
		if mi.IsFile {
			mi.V = ""
		}
		multipartItems = append(multipartItems, mi)
	}

	var o = models.ExportedGurlReq{
		Version:        internal.SCHEMA_VERSION,
		Name:           input.Name,
		Url:            input.Url,
		Method:         input.Method,
		Headers:        toExportedKeyValItem(input.Headers),
		QueryParams:    toExportedKeyValItem(input.Query),
		PathParams:     toExportedKeyValItem(input.Path),
		Cookies:        toExportedKeyValItem(input.Cookies),
		BodyType:       models.ValidateOrDefaultBodyType(input.BodyType, models.NoBodyType),
		UrlEncodedBody: toExportedKeyValItem(input.UrlEncodedForm),
		MultipartBody:  multipartItems,
		TextBody:       input.TextBody,
		BinaryBody:     "",
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

func (ex *InternalExporter) ExportCollection(ctx context.Context, collectionId string) (*models.ExportedGurlCollection, error) {

	collection, err := ex.collectionRepo.FindCollectionById(ctx, collectionId)

	if err != nil {
		return nil, err
	}

	requests, err := ex.reqRepo.FindSavedReqByCollectionId(ctx, collectionId)

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

func (ex *InternalExporter) ExportEnvironment(ctx context.Context, id string) (*models.ExportedEnvironment, error) {
	env, err := ex.envRepo.FindSavedEnvById(ctx, id)

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
