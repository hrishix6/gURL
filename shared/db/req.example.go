package db

import (
	"context"
	"encoding/json"
	"fmt"
	"gurl/shared/models"
	"gurl/shared/utils"
	"io"
	"os"
	"path/filepath"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type RequestExample struct {
	BaseEntity
	RequestCore
	RequestId    string     `gorm:"column:request_id;not null"`
	Request      Request    `gorm:"foreignKey:RequestId;"`
	CollectionId string     `gorm:"not null"`
	Collection   Collection `gorm:"foreignKey:CollectionId;"`
	Name         string     `gorm:"column:name;not null"`
	UploadSize   int64      `gorm:"column:upload_size;"`

	// Response Data
	ResponseSuccess    bool   `gorm:"column:response_success"`
	ResponseStatus     int64  `gorm:"column:response_status"`
	ResponseStatusText string `gorm:"column:response_status_text"`
	ResponseTime       int64  `gorm:"column:response_time"`
	ResponseSize       int64  `gorm:"column:response_size"`
	LimitExceeded      bool   `gorm:"column:limit_exceeded"`
	ResponseTffbMs     int64  `gorm:"column:response_tffb_ms"`
	ResponseDlMs       int64  `gorm:"column:response_dl_ms"`

	SentHeaders      datatypes.JSON `gorm:"column:sent_headers;default:'[]'"`
	ResponseHeaders  datatypes.JSON `gorm:"column:response_headers;default:'[]'"`
	ResponseCookies  datatypes.JSON `gorm:"column:response_cookies;default:'[]'"`
	ResponseBody     datatypes.JSON `gorm:"column:response_body"`
	ResponseSavePath string         `gorm:"column:save_path;not null"`
	WorkspaceId      string         `gorm:"column:workspace_id;not null"`
	Workspace        Workspace      `gorm:"foreignKey:WorkspaceId;"`
	UserId           string         `gorm:"column:user_id;not null"`
	User             User           `gorm:"foreignKey:UserId;"`
}

// Hooks
func (re *RequestExample) AfterDelete(tx *gorm.DB) error {
	if re.ResponseSavePath != "" {
		err := os.Remove(re.ResponseSavePath)

		if err != nil {
			return err
		}
	}

	return nil
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
	tmpDir string,
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
		UserId:       utils.UserIdFromContext(ctx),
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

	srcPath := filepath.Join(tmpDir, meta.Filename)

	//copy temp response to saved responses
	srcF, err := os.Open(srcPath)

	if err != nil {
		return err
	}
	defer srcF.Close()

	dstFileName := fmt.Sprintf("%s%s", dto.Id, meta.Extension)

	dstFilePath := filepath.Join(savedResponsesDir, dstFileName)

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
		Extension:    meta.Extension,
		Src:          "",
		Filename:     dstFileName,
	}

	bytes, err := json.Marshal(renderMeta)

	if err != nil {
		return err
	}

	example.ResponseBody = datatypes.JSON(bytes)
	example.ResponseSavePath = dstFilePath

	return gorm.G[RequestExample](rer.db).Create(ctx, example)
}

func (rer *ReqExampleRepository) GetReqExampleById(ctx context.Context, id string) (*models.ReqExampleDTO, error) {

	var example RequestExample

	tx := rer.db.Where(&RequestExample{
		BaseEntity: BaseEntity{
			Id: id,
		},
		UserId: utils.UserIdFromContext(ctx),
	}).First(&example)

	if tx.Error != nil {
		return nil, tx.Error
	}

	return example.ToReqExampleDTO(), nil
}

func (rer *ReqExampleRepository) GetReqExamples(ctx context.Context, workspaceId string) ([]models.ReqExampleLightDTO, error) {

	var records []RequestExample

	tx := rer.db.Where(&RequestExample{
		WorkspaceId: workspaceId,
		UserId:      utils.UserIdFromContext(ctx),
	}).Find(&records)

	if tx.Error != nil {
		return []models.ReqExampleLightDTO{}, tx.Error
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

	var example RequestExample

	tx := rer.db.Where(&RequestExample{
		BaseEntity: BaseEntity{
			Id: id,
		},
		UserId: utils.UserIdFromContext(ctx),
	}).First(&example)

	if tx.Error != nil {
		return tx.Error
	}

	return rer.db.Delete(&example).Error
}
