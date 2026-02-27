package storage

import (
	"encoding/json"
	"fmt"
	"gurl/internal/db"
	"gurl/internal/models"
	"io"
	"log"
	"os"
	"path/filepath"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

func (s *Storage) AddReqExample(dto models.ReqExampleDTO, meta models.SavedResponseRenderMeta) error {

	example := &db.RequestExample{
		BaseEntity: db.BaseEntity{
			Id: dto.Id,
		},
		RequestCore: db.RequestCore{
			Url:            dto.Url,
			Method:         dto.Method,
			Headers:        datatypes.JSON([]byte(dto.Headers)),
			Cookies:        datatypes.JSON([]byte(dto.Cookies)),
			BodyType:       dto.BodyType,
			UrlEncodedForm: datatypes.JSON([]byte(dto.UrlEncodedFormBody)),
			MultipartForm:  datatypes.JSON([]byte(dto.MultipartFormBody)),
			TextBody:       dto.TextBody,
			BinaryBody:     datatypes.JSON([]byte(dto.BinaryBody)),
			Query:          datatypes.JSON([]byte(dto.Query)),
			AuthType:       dto.AuthType,
			BasicAuth:      datatypes.JSON([]byte(dto.BasicAuth)),
			ApiKeyAuth:     datatypes.JSON([]byte(dto.ApiKeyAuth)),
			TokenAuth:      datatypes.JSON([]byte(dto.TokenAuth)),
		},
		RequestId:    dto.RequestId,
		CollectionId: dto.CollectionId,
		Name:         dto.Name,

		//Response data
		ResponseSuccess:    dto.ResponseSuccess,
		ResponseStatus:     dto.ResponseStatus,
		ResponseStatusText: dto.ResponseStatusText,
		ResponseTime:       dto.ResponseTime,
		ResponseSize:       dto.ResponseSize,
		ResponseTffbMs:     dto.ResponseTffbMs,
		ResponseDlMs:       dto.ResponseDlMs,
		LimitExceeded:      dto.LimitExceeded,
		UploadSize:         dto.UploadSize,
		SentHeaders:        datatypes.JSON([]byte(dto.SentHeaders)),
		ResponseHeaders:    datatypes.JSON([]byte(dto.ResponseHeaders)),
		ResponseCookies:    datatypes.JSON([]byte(dto.ResponseCookies)),
	}

	//copy temp response to saved responses
	srcF, err := os.Open(meta.Filepath)

	if err != nil {
		return err
	}
	defer srcF.Close()

	dstFilePath := filepath.Join(s.savedResponsesDir, fmt.Sprintf("%s%s", dto.Id, meta.Extension))

	dstF, err := os.Create(dstFilePath)

	if err != nil {
		return err
	}
	defer dstF.Close()

	_, err = io.Copy(dstF, srcF)

	if err != nil {
		return err
	}

	renderMeta := models.SavedResponseRenderMeta{
		CanRender:    meta.CanRender,
		Html5Element: meta.Html5Element,
		Filepath:     dstFilePath,
		Extension:    meta.Extension,
		Src:          "",
	}

	bytes, err := json.Marshal(renderMeta)

	if err != nil {
		return err
	}

	example.ResponseBody = datatypes.JSON(bytes)

	return gorm.G[db.RequestExample](s.db).Create(s.appCtx, example)
}

func (s *Storage) GetReqExampleById(id string) (*models.ReqExampleDTO, error) {

	example, err := gorm.G[db.RequestExample](s.db).Where("id = ?", id).First(s.appCtx)

	if err != nil {
		return nil, err
	}

	return example.ToReqExampleDTO(), nil
}

func (s *Storage) GetReqExamples() ([]models.ReqExampleLightDTO, error) {

	records, err := gorm.G[db.RequestExample](s.db).Find(s.appCtx)

	if err != nil {
		return []models.ReqExampleLightDTO{}, err
	}

	var results []models.ReqExampleLightDTO

	for _, record := range records {
		results = append(results, models.ReqExampleLightDTO{
			Id:        record.Id,
			RequestId: record.RequestId,
			Name:      record.Name,
		})
	}

	return results, nil
}

func (s *Storage) DeleteReqExample(id string) error {
	example, err := gorm.G[db.RequestExample](s.db).Where("id = ?", id).First(s.appCtx)

	if err != nil {
		return err
	}

	var renderMeta models.SavedResponseRenderMeta

	err = json.Unmarshal(example.ResponseBody, &renderMeta)

	if err != nil {
		return err
	}

	if renderMeta.Filepath != "" {
		err = os.Remove(renderMeta.Filepath)

		if err != nil {
			log.Printf("unable to delete saved response file at %s\n", renderMeta.Filepath)
		}
	}

	_, err = gorm.G[db.RequestExample](s.db).Where("id = ?", id).Delete(s.appCtx)

	if err != nil {
		return err
	}

	return nil
}
