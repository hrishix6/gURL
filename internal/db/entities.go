package db

import (
	"gurl/internal/models"
	"strings"

	"gorm.io/datatypes"
)

type MimeRecord struct {
	Id         string `gorm:"primaryKey"`
	Extensions string //comma separated list of extensions
}

func (mr *MimeRecord) FromJsonRecord(key string, record models.MimeData) MimeRecord {

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
	Id                  string         `gorm:"primaryKey;column:id"`
	OpenTabs            datatypes.JSON `gorm:"column:openTabs;default:'[]'"`
	ActiveTab           string         `gorm:"column:activeTab"`
	IsSidebarOpen       bool           `gorm:"column:sidebarOpen;default:false"`
	AlwaysDiscardDrafts bool           `gorm:"column:alwaysDiscardDrafts;default:false"`
	Layout              string         `gorm:"column:layout;default:r"`
	Created             int            `gorm:"autoCreateTime;column:created"`
	UpdatedAt           int            `gorm:"autoUpdateTime;column:updated"`
}

type Collection struct {
	Id        string `gorm:"primaryKey;column:id"`
	Name      string `gorm:"column:name"`
	Created   int    `gorm:"autoCreateTime;column:created"`
	UpdatedAt int    `gorm:"autoUpdateTime;column:updated"`
}

func (c *Collection) ToCollectionDTO() *models.CollectionDTO {

	o := &models.CollectionDTO{
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
	Cookies            datatypes.JSON `gorm:"column:cookies;default:'[]'"`
	MultipartForm      datatypes.JSON `gorm:"column:multipart;default:'[]'"`
	UrlEncodedForm     datatypes.JSON `gorm:"column:urlencoded;default:'[]'"`
	TextBody           string         `gorm:"column:textbody"`
	BinaryBody         datatypes.JSON `gorm:"column:binarybody"`
	Method             string         `gorm:"column:method;default:GET"`
	BodyType           string         `gorm:"column:bodyType;default:none"`
	AuthEnabled        bool           `gorm:"column:authEnabled;default:false"`
	AuthType           string         `gorm:"column:authType;default:no_auth"`
	BasicAuth          datatypes.JSON `gorm:"column:basicAuth"`
	ApiKeyAuth         datatypes.JSON `gorm:"column:apiKeyAuth"`
	TokenAuth          datatypes.JSON `gorm:"column:tokenAuth"`
	ParentRequestId    string         `gorm:"column:parentRequestId"`
	ParentRequestName  string         `gorm:"column:parentRequestName"`
	ParentCollectionId string         `gorm:"column:parentCollectionId"`
	Created            int            `gorm:"autoCreateTime;column:created"`
	UpdatedAt          int            `gorm:"autoUpdateTime;column:updated"`
}

func (r *RequestDraft) FromRequestDraftDTO(dto *models.RequestDraftDTO) {

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
	r.Cookies = datatypes.JSON([]byte(dto.Cookies))
	r.BodyType = dto.BodyType
	r.TextBody = dto.TextBody
	r.UrlEncodedForm = datatypes.JSON([]byte(dto.UrlEncodedFormBody))
	r.MultipartForm = datatypes.JSON([]byte(dto.MultipartFormBody))
	r.BinaryBody = datatypes.JSON([]byte(dto.BinaryBody))

	//auth
	r.ApiKeyAuth = datatypes.JSON([]byte(dto.ApiKeyAuth))
	r.BasicAuth = datatypes.JSON([]byte(dto.BasicAuth))
	r.TokenAuth = datatypes.JSON([]byte(dto.TokenAuth))
	r.AuthType = dto.AuthType
	r.AuthEnabled = dto.AuthEnabled
}

func (r *RequestDraft) ToRequestDraftDTO() *models.RequestDraftDTO {
	return &models.RequestDraftDTO{
		Id:                 r.Id,
		Url:                r.Url,
		Method:             r.Method,
		Query:              string(r.Query),
		Headers:            string(r.Headers),
		Cookies:            string(r.Cookies),
		BodyType:           r.BodyType,
		MultipartFormBody:  string(r.MultipartForm),
		UrlEncodedFormBody: string(r.UrlEncodedForm),
		TextBody:           r.TextBody,
		BinaryBody:         string(r.BinaryBody),
		ParentRequestId:    r.ParentRequestId,
		ParentRequestName:  r.ParentRequestName,
		ParentCollectionId: r.ParentCollectionId,
		AuthEnabled:        r.AuthEnabled,
		AuthType:           r.AuthType,
		BasicAuth:          string(r.BasicAuth),
		ApiKeyAuth:         string(r.ApiKeyAuth),
		TokenAuth:          string(r.TokenAuth),
	}
}

type Request struct {
	Id             string         `gorm:"primaryKey;column:id"`
	Url            string         `gorm:"column:url"`
	Name           string         `gorm:"column:name;not null"`
	Query          datatypes.JSON `gorm:"column:query;default:'[]'"`
	Headers        datatypes.JSON `gorm:"column:headers;default:'[]'"`
	Cookies        datatypes.JSON `gorm:"column:cookies;default:'[]'"`
	MultipartForm  datatypes.JSON `gorm:"column:multipart;default:'[]'"`
	UrlEncodedForm datatypes.JSON `gorm:"column:urlencoded;default:'[]'"`
	TextBody       string         `gorm:"column:textbody"`
	BinaryBody     datatypes.JSON `gorm:"column:binarybody"`
	Method         string         `gorm:"column:method;default:GET"`
	BodyType       string         `gorm:"column:bodyType;default:none"`
	AuthEnabled    bool           `gorm:"column:authEnabled;default:false"`
	AuthType       string         `gorm:"column:authType;default:no_auth"`
	BasicAuth      datatypes.JSON `gorm:"column:basicAuth"`
	ApiKeyAuth     datatypes.JSON `gorm:"column:apiKeyAuth"`
	TokenAuth      datatypes.JSON `gorm:"column:tokenAuth"`
	CollectionId   string         `gorm:"not null"`
	Collection     Collection     `gorm:"constraint:OnDelete:CASCADE;"`
	Created        int            `gorm:"autoCreateTime;column:created"`
	UpdatedAt      int            `gorm:"autoUpdateTime;column:updated"`
}

func (r *Request) ToRequestDTO() *models.RequestDTO {
	return &models.RequestDTO{
		Id:                 r.Id,
		Url:                r.Url,
		Method:             r.Method,
		Name:               r.Name,
		Query:              string(r.Query),
		Headers:            string(r.Headers),
		Cookies:            string(r.Cookies),
		BodyType:           r.BodyType,
		MultipartFormBody:  string(r.MultipartForm),
		UrlEncodedFormBody: string(r.UrlEncodedForm),
		TextBody:           r.TextBody,
		BinaryBody:         string(r.BinaryBody),
		CollectionId:       r.CollectionId,
		AuthEnabled:        r.AuthEnabled,
		AuthType:           r.AuthType,
		BasicAuth:          string(r.BasicAuth),
		ApiKeyAuth:         string(r.ApiKeyAuth),
		TokenAuth:          string(r.TokenAuth),
	}
}

func (r *Request) FromRequestDraft(payload *models.SaveDraftAsReqDTO, dto *RequestDraft) {
	if r == nil {
		r = &Request{}
	}

	r.Id = payload.RequestId
	r.Url = dto.Url
	r.Method = dto.Method
	r.Query = dto.Query
	r.Headers = dto.Headers
	r.BodyType = dto.BodyType
	r.Cookies = dto.Cookies
	r.TextBody = dto.TextBody
	r.UrlEncodedForm = dto.UrlEncodedForm
	r.MultipartForm = dto.MultipartForm
	r.BinaryBody = dto.BinaryBody
	r.CollectionId = payload.CollectionId
	r.Name = payload.Name

	//auth
	r.ApiKeyAuth = dto.ApiKeyAuth
	r.BasicAuth = dto.BasicAuth
	r.TokenAuth = dto.TokenAuth
	r.AuthType = dto.AuthType
	r.AuthEnabled = dto.AuthEnabled
}
