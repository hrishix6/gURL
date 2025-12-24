package models

import (
	"strings"

	"gorm.io/datatypes"
)

const (
	DEFAULT_COLLECTION  = "gurl_default_collection"
	DEFAULT_UI_STATE_ID = "gurl_ui_state"
)

type MimeRecord struct {
	Id         string `gorm:"primaryKey"`
	Extensions string //comma separated list of extensions
}

func (mr *MimeRecord) FromJsonRecord(key string, record MimeData) MimeRecord {

	var extensions string

	if len(record.Extensions) > 0 {
		extensions = strings.Join(record.Extensions, ",")
	}

	return MimeRecord{
		Id:         key,
		Extensions: extensions,
	}
}

type UIState struct {
	Id        string         `gorm:"primaryKey;column:id"`
	OpenTabs  datatypes.JSON `gorm:"column:openTabs;default:'[]'"`
	ActiveTab string         `gorm:"column:activeTab"`
	Created   int            `gorm:"autoCreateTime;column:created"`
	UpdatedAt int            `gorm:"autoUpdateTime;column:updated"`
}

type Collection struct {
	Id        string `gorm:"primaryKey;column:id"`
	Name      string `gorm:"column:name"`
	Created   int    `gorm:"autoCreateTime;column:created"`
	UpdatedAt int    `gorm:"autoUpdateTime;column:updated"`
}

func (c *Collection) ToCollectionDTO() *CollectionDTO {

	o := &CollectionDTO{
		Id:   c.Id,
		Name: c.Name,
	}

	return o
}

type RequestDraft struct {
	Id                 string         `gorm:"primaryKey;column:id"`
	Url                string         `gorm:"column:url"`
	Query              datatypes.JSON `gorm:"column:query;default:'[]'"`
	Headers            datatypes.JSON `gorm:"column:headers;default:'[]'"`
	MultipartForm      datatypes.JSON `gorm:"column:multipart;default:'[]'"`
	UrlEncodedForm     datatypes.JSON `gorm:"column:urlencoded;default:'[]'"`
	TextBody           string         `gorm:"column:textbody"`
	BinaryBody         datatypes.JSON `gorm:"column:binarybody"`
	Method             string         `gorm:"column:method;default:GET"`
	BodyType           string         `gorm:"column:bodyType;default:none"`
	ParentRequestId    string         `gorm:"column:parentRequestId"`
	ParentRequestName  string         `gorm:"column:parentRequestName"`
	ParentCollectionId string         `gorm:"column:parentCollectionId"`
	Created            int            `gorm:"autoCreateTime;column:created"`
	UpdatedAt          int            `gorm:"autoUpdateTime;column:updated"`
}

type Request struct {
	Id             string         `gorm:"primaryKey;column:id"`
	Url            string         `gorm:"column:url"`
	Name           string         `gorm:"column:name;not null"`
	Query          datatypes.JSON `gorm:"column:query;default:'[]'"`
	Headers        datatypes.JSON `gorm:"column:headers;default:'[]'"`
	MultipartForm  datatypes.JSON `gorm:"column:multipart;default:'[]'"`
	UrlEncodedForm datatypes.JSON `gorm:"column:urlencoded;default:'[]'"`
	TextBody       string         `gorm:"column:textbody"`
	BinaryBody     datatypes.JSON `gorm:"column:binarybody"`
	Method         string         `gorm:"column:method;default:GET"`
	BodyType       string         `gorm:"column:bodyType;default:none"`
	CollectionId   string         `gorm:"not null"`
	Collection     Collection     `gorm:"constraint:OnDelete:CASCADE;"`
	Created        int            `gorm:"autoCreateTime;column:created"`
	UpdatedAt      int            `gorm:"autoUpdateTime;column:updated"`
}

func (r *RequestDraft) ToRequestDraftDTO() *RequestDraftDTO {
	return &RequestDraftDTO{
		Id:                 r.Id,
		Url:                r.Url,
		Method:             r.Method,
		Query:              string(r.Query),
		Headers:            string(r.Headers),
		BodyType:           r.BodyType,
		MultipartFormBody:  string(r.MultipartForm),
		UrlEncodedFormBody: string(r.UrlEncodedForm),
		TextBody:           r.TextBody,
		BinaryBody:         string(r.BinaryBody),
		ParentRequestId:    r.ParentRequestId,
		ParentRequestName:  r.ParentRequestName,
		ParentCollectionId: r.ParentCollectionId,
	}
}

func (r *Request) ToRequestDTO() *RequestDTO {
	return &RequestDTO{
		Id:                 r.Id,
		Url:                r.Url,
		Method:             r.Method,
		Name:               r.Name,
		Query:              string(r.Query),
		Headers:            string(r.Headers),
		BodyType:           r.BodyType,
		MultipartFormBody:  string(r.MultipartForm),
		UrlEncodedFormBody: string(r.UrlEncodedForm),
		TextBody:           r.TextBody,
		BinaryBody:         string(r.BinaryBody),
		CollectionId:       r.CollectionId,
	}
}

func (r *Request) FromRequestDraft(payload *SaveDraftAsReqDTO, dto *RequestDraft) {
	if r == nil {
		r = &Request{}
	}

	r.Id = payload.RequestId
	r.Url = dto.Url
	r.Method = dto.Method
	r.Query = dto.Query
	r.Headers = dto.Headers
	r.BodyType = dto.BodyType
	r.TextBody = dto.TextBody
	r.UrlEncodedForm = dto.UrlEncodedForm
	r.MultipartForm = dto.MultipartForm
	r.BinaryBody = dto.BinaryBody
	r.CollectionId = payload.CollectionId
	r.Name = payload.Name
}

func (r *RequestDraft) FromRequestDraftDTO(dto *RequestDraftDTO) {

	if r == nil {
		r = &RequestDraft{}
	}

	r.Id = dto.Id
	r.ParentRequestId = dto.ParentRequestId
	r.ParentRequestName = dto.ParentRequestName
	r.ParentCollectionId = dto.ParentCollectionId
	r.Url = dto.Url
	r.Method = dto.Method
	r.Query = datatypes.JSON([]byte(dto.Query))
	r.Headers = datatypes.JSON([]byte(dto.Headers))
	r.BodyType = dto.BodyType
	r.TextBody = dto.TextBody
	r.UrlEncodedForm = datatypes.JSON([]byte(dto.UrlEncodedFormBody))
	r.MultipartForm = datatypes.JSON([]byte(dto.MultipartFormBody))
	r.BinaryBody = datatypes.JSON([]byte(dto.BinaryBody))
}
