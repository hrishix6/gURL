package db

import (
	"gurl/internal/models"

	"gorm.io/datatypes"
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
