package db

import (
	"context"
	"encoding/json"
	"fmt"
	"gurl/internal/models"
	"io"
	"log"
	"os"
	"path/filepath"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type RequestExample struct {
	BaseEntity
	RequestCore
	RequestId    string `gorm:"not null"`
	CollectionId string `gorm:"not null"`
	Name         string `gorm:"column:name;not null"`
	UploadSize   int64  `gorm:"column:uploadSize;"`

	// Response Data
	ResponseSuccess    bool   `gorm:"column:responseSuccess"`
	ResponseStatus     int64  `gorm:"column:responseStatus"`
	ResponseStatusText string `gorm:"column:responseStatusText"`
	ResponseTime       int64  `gorm:"column:responseTime"`
	ResponseSize       int64  `gorm:"column:responseSize"`
	LimitExceeded      bool   `gorm:"column:limitExceeded"`
	ResponseTffbMs     int64  `gorm:"column:responseTffbMs"`
	ResponseDlMs       int64  `gorm:"column:responseDlMs"`

	SentHeaders     datatypes.JSON `gorm:"column:sentHeaders;default:'[]'"`
	ResponseHeaders datatypes.JSON `gorm:"column:responseHeaders;default:'[]'"`
	ResponseCookies datatypes.JSON `gorm:"column:responseCookies;default:'[]'"`
	ResponseBody    datatypes.JSON `gorm:"column:responseBody"`
	WorkspaceId     string         `gorm:"column:workspace_id;default:null"`
}

func (r *RequestExample) ToReqExampleDTO() *models.ReqExampleDTO {
	o := &models.ReqExampleDTO{
		Id:                 r.Id,
		RequestId:          r.RequestId,
		CollectionId:       r.CollectionId,
		Name:               r.Name,
		RequestCoreDTO:     r.ToRequestCoreDTO(),
		UploadSize:         r.UploadSize,
		ResponseSuccess:    r.ResponseSuccess,
		ResponseStatus:     r.ResponseStatus,
		ResponseStatusText: r.ResponseStatusText,
		ResponseTime:       r.ResponseTime,
		ResponseSize:       r.ResponseSize,
		LimitExceeded:      r.LimitExceeded,
		ResponseTffbMs:     r.ResponseTffbMs,
		ResponseDlMs:       r.ResponseDlMs,
		SentHeaders:        string(r.SentHeaders),
		ResponseHeaders:    string(r.ResponseHeaders),
		ResponseCookies:    string(r.ResponseCookies),
		ResponseBody:       string(r.ResponseBody),
	}

	return o
}

type ReqExampleRepository struct {
	db *gorm.DB
}

func NewReqExampleRepository(db *gorm.DB) *ReqExampleRepository {
	return &ReqExampleRepository{
		db: db,
	}
}

func (rer *ReqExampleRepository) AddReqExample(ctx context.Context,
	dto models.ReqExampleDTO,
	meta models.SavedResponseRenderMeta,
	savedResponsesDir string,
) error {

	example := &RequestExample{
		BaseEntity: BaseEntity{
			Id: dto.Id,
		},
		RequestCore: RequestCore{
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
		WorkspaceId:  dto.WorkspaceId,
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

	dstFilePath := filepath.Join(savedResponsesDir, fmt.Sprintf("%s%s", dto.Id, meta.Extension))

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

	return gorm.G[RequestExample](rer.db).Create(ctx, example)
}

func (rer *ReqExampleRepository) GetReqExampleById(ctx context.Context, id string) (*models.ReqExampleDTO, error) {

	example, err := gorm.G[RequestExample](rer.db).Where("id = ?", id).First(ctx)

	if err != nil {
		return nil, err
	}

	return example.ToReqExampleDTO(), nil
}

func (rer *ReqExampleRepository) GetReqExamples(ctx context.Context, workspaceId string) ([]models.ReqExampleLightDTO, error) {

	records, err := gorm.G[RequestExample](rer.db).Where("workspace_id = ?", workspaceId).Find(ctx)

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

func (rer *ReqExampleRepository) DeleteReqExample(ctx context.Context, id string) error {
	example, err := gorm.G[RequestExample](rer.db).Where("id = ?", id).First(ctx)

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

	_, err = gorm.G[RequestExample](rer.db).Where("id = ?", id).Delete(ctx)

	if err != nil {
		return err
	}

	return nil
}
