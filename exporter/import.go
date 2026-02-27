package exporter

import (
	"encoding/json"
	"errors"
	"fmt"
	"gurl/internal/db"
	"gurl/internal/models"
	"gurl/internal/nanoid"
	"gurl/internal/utils"
	"os"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

func toImportedBasicAuth(raw json.RawMessage) (datatypes.JSON, error) {
	var item models.BasicAuth

	err := json.Unmarshal(raw, &item)

	if err != nil {
		return nil, err
	}

	return datatypes.JSON(raw), nil
}

func toImportedTokenAuth(raw json.RawMessage) (datatypes.JSON, error) {
	var item models.TokenAuth

	err := json.Unmarshal(raw, &item)

	if err != nil {
		return nil, err
	}

	return datatypes.JSON(raw), nil
}

func toImportedApiKeyAuth(raw json.RawMessage) (datatypes.JSON, error) {
	var item models.ApiKeyAuth

	err := json.Unmarshal(raw, &item)

	if err != nil {
		return nil, err
	}

	return datatypes.JSON(raw), nil
}

func toImportedMultipartFileItem(item models.ExportedMultipartItem) (*models.UIMultipartFileItem, error) {

	fileStats, err := utils.GetFileStats(item.V)

	if err != nil {
		return nil, err
	}

	return &models.UIMultipartFileItem{
		Id:      nanoid.Must(),
		Key:     item.K,
		Value:   *fileStats,
		Enabled: "on",
	}, nil
}

func toImportedMultipartItems(raw json.RawMessage) (datatypes.JSON, error) {

	var items []models.ExportedMultipartItem

	err := json.Unmarshal(raw, &items)

	if err != nil {
		return nil, err
	}

	im := []any{}

	for _, item := range items {
		if strings.TrimSpace(item.K) == "" {
			continue
		}

		if item.IsFile {
			fileItem, err := toImportedMultipartFileItem(item)

			if err != nil {
				continue
			}

			im = append(im, fileItem)

		} else {
			im = append(im, models.UIMultipartKeyValueItem{
				Id:      nanoid.Must(),
				Key:     item.K,
				Value:   item.V,
				Enabled: "on",
			})
		}
	}

	bs, err := json.Marshal(im)

	if err != nil {
		return nil, err
	}

	return datatypes.JSON(bs), nil
}

func toImportedKeyValItems(raw json.RawMessage) (datatypes.JSON, error) {

	var items []models.ExportedKeyValItem

	err := json.Unmarshal(raw, &items)

	if err != nil {
		return nil, err
	}

	im := []models.UIKeyValueItem{}

	for _, item := range items {
		if strings.TrimSpace(item.K) == "" {
			continue
		}
		im = append(im, models.UIKeyValueItem{
			Id:      nanoid.Must(),
			Key:     item.K,
			Value:   item.V,
			Enabled: "on",
		})
	}

	bs, err := json.Marshal(im)

	if err != nil {
		return nil, err
	}

	return datatypes.JSON(bs), nil
}

func toDbRequestFromImported(importedReq models.ImportedGurlReq, collectionId string) (*db.Request, error) {

	newReq := &db.Request{
		BaseEntity: db.BaseEntity{
			Id: nanoid.Must(),
		},
		CollectionId: collectionId,
	}

	if importedReq.Name == nil || strings.TrimSpace(*importedReq.Name) == "" {
		return nil, errors.New("invalid request name")
	}

	if importedReq.Version == nil || strings.TrimSpace(*importedReq.Version) == "" {
		return nil, errors.New("invalid request version")
	}

	newReq.Name = strings.TrimSpace(*importedReq.Name)

	if importedReq.Url == nil {
		newReq.Url = ""
	} else {
		newReq.Url = strings.TrimSpace(*importedReq.Url)
	}

	newReq.Method = string(models.ValidOrDefaultMethod(*importedReq.Method))

	queryItems, err := toImportedKeyValItems(importedReq.QueryParams)
	if err == nil {
		newReq.Query = queryItems
	}

	pathParams, err := toImportedKeyValItems(importedReq.PathParams)
	if err == nil {
		newReq.Path = pathParams
	}

	headerItems, err := toImportedKeyValItems(importedReq.Headers)
	if err == nil {
		newReq.Headers = headerItems
	}

	cookieItems, err := toImportedKeyValItems(importedReq.Cookies)
	if err == nil {
		newReq.Cookies = cookieItems
	}

	urlEncodedItems, err := toImportedKeyValItems(importedReq.UrlEncodedBody)
	if err == nil {
		newReq.UrlEncodedForm = urlEncodedItems
	}

	multipartItems, err := toImportedMultipartItems(importedReq.MultipartBody)
	if err == nil {
		newReq.MultipartForm = multipartItems
	}

	if importedReq.BodyType != nil {
		newReq.BodyType = string(models.ValidateOrDefaultBodyType(*importedReq.BodyType, models.NoBodyType))
	}

	if importedReq.TextBody != nil {
		newReq.TextBody = *importedReq.TextBody
	}

	if importedReq.BinaryBody != nil {
		bStats, err := utils.GetFileStats(*importedReq.BinaryBody)

		if err == nil {

			bjson, err := json.Marshal(bStats)

			if err == nil {
				newReq.BinaryBody = datatypes.JSON(bjson)
			}
		}
	}

	if importedReq.AuthType != nil {
		newReq.AuthType = string(models.ValidateOrDefaultAuthType(*importedReq.AuthType, models.NoAuthType))

		if newReq.AuthType != string(models.NoAuthType) {
			newReq.AuthEnabled = true
		}
	}

	if importedReq.BasicAuth != nil {
		basicAuthJson, err := toImportedBasicAuth(importedReq.BasicAuth)

		if err == nil {
			newReq.BasicAuth = basicAuthJson
		}
	}

	if importedReq.ApiKeyAuth != nil {
		apiKeyAuthJson, err := toImportedApiKeyAuth(importedReq.ApiKeyAuth)
		if err == nil {
			newReq.ApiKeyAuth = apiKeyAuthJson
		}
	}

	if importedReq.TokenAuth != nil {
		tokenAuthJson, err := toImportedTokenAuth(importedReq.TokenAuth)
		if err == nil {
			newReq.TokenAuth = tokenAuthJson
		}
	}

	return newReq, nil
}

func (ex *Exporter) ImportCollection() error {

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

	srcF, err := os.Open(src)

	if err != nil {
		return err
	}

	defer srcF.Close()

	var importedCollection models.ImportedCollection

	err = json.NewDecoder(srcF).Decode(&importedCollection)

	if err != nil {
		return err
	}

	if importedCollection.Name == nil || strings.TrimSpace(*importedCollection.Name) == "" {
		return errors.New("invalid collection name")
	}

	if importedCollection.Version == nil || strings.TrimSpace(*importedCollection.Version) == "" {
		return errors.New("invalid collection version")
	}

	var importedRequests []models.ImportedGurlReq

	err = json.Unmarshal(importedCollection.Requests, &importedRequests)

	if err != nil {
		return err
	}

	if len(importedRequests) == 0 {
		return ex.handleImportEmptyCollection(importedCollection)
	}

	return ex.handleImportWithRequests(importedCollection, importedRequests)

}

func (ex *Exporter) handleImportEmptyCollection(collection models.ImportedCollection) error {

	cnt, err := gorm.G[db.Collection](ex.db).Where("name = ?", *collection.Name).Count(ex.appCtx, "id")

	if err != nil {
		return err
	}

	name := *collection.Name

	if cnt > 0 {
		name = fmt.Sprintf("%s(%d)", name, cnt)
	}

	return gorm.G[db.Collection](ex.db).Create(ex.appCtx, &db.Collection{
		BaseEntity: db.BaseEntity{
			Id: nanoid.Must(),
		},
		Name: name,
	})
}

func (ex *Exporter) handleImportWithRequests(collection models.ImportedCollection, requests []models.ImportedGurlReq) error {

	cnt, err := gorm.G[db.Collection](ex.db).Where("name = ?", *collection.Name).Count(ex.appCtx, "id")

	if err != nil {
		return err
	}

	name := *collection.Name

	if cnt > 0 {
		name = fmt.Sprintf("%s(%d)", name, cnt)
	}

	newCollection := &db.Collection{
		BaseEntity: db.BaseEntity{
			Id: nanoid.Must(),
		},
		Name: name,
	}

	err = gorm.G[db.Collection](ex.db).Create(ex.appCtx, newCollection)

	if err != nil {
		return err
	}

	var newRequests []db.Request

	for _, req := range requests {
		newReq, err := toDbRequestFromImported(req, newCollection.Id)

		if err != nil {
			continue
		}

		newRequests = append(newRequests, *newReq)
	}

	return gorm.G[db.Request](ex.db).CreateInBatches(ex.appCtx, &newRequests, 20)
}

func (ex *Exporter) ImportEnvironment() error {
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

	srcF, err := os.Open(src)

	if err != nil {
		return err
	}

	defer srcF.Close()

	var importedEnv models.ImportedEnvironment

	err = json.NewDecoder(srcF).Decode(&importedEnv)

	if err != nil {
		return err
	}

	if importedEnv.Name == nil || strings.TrimSpace(*importedEnv.Name) == "" {
		return errors.New("invalid environment name")
	}

	if importedEnv.Version == nil || strings.TrimSpace(*importedEnv.Version) == "" {
		return errors.New("invalid environment version")
	}

	var exportedItems []models.ExportedEnvironmentItem

	err = json.Unmarshal(importedEnv.Vars, &exportedItems)

	if err != nil {
		return err
	}

	var uiItems []models.UIEnvironmentItem

	for _, item := range exportedItems {
		uiItems = append(uiItems, models.UIEnvironmentItem{
			Id:          nanoid.Must(),
			Key:         item.K,
			Value:       item.V,
			IsSecret:    item.IsSecret,
			Description: item.Description,
		})
	}

	bs, err := json.Marshal(uiItems)

	if err != nil {
		return err
	}

	cnt, err := gorm.G[db.Environment](ex.db).Where("name = ?", *importedEnv.Name).Count(ex.appCtx, "id")

	if err != nil {
		return err
	}

	name := *importedEnv.Name

	if cnt > 0 {
		name = fmt.Sprintf("%s(%d)", name, cnt)
	}

	var dbEnv = &db.Environment{
		BaseEntity: db.BaseEntity{
			Id: nanoid.Must(),
		},
		Name: name,
		Data: datatypes.JSON(bs),
	}

	return gorm.G[db.Environment](ex.db).Create(ex.appCtx, dbEnv)
}
