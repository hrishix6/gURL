package db

import (
	"gurl/internal/models"

	"gorm.io/datatypes"
)

type RequestCore struct {
	Url     string         `gorm:"column:url"`
	Method  string         `gorm:"column:method;default:GET"`
	Query   datatypes.JSON `gorm:"column:query;default:'[]'"`
	Path    datatypes.JSON `gorm:"column:path;default:'[]'"`
	Headers datatypes.JSON `gorm:"column:headers;default:'[]'"`
	Cookies datatypes.JSON `gorm:"column:cookies;default:'[]'"`

	BodyType       string         `gorm:"column:bodyType;default:none"`
	MultipartForm  datatypes.JSON `gorm:"column:multipart;default:'[]'"`
	UrlEncodedForm datatypes.JSON `gorm:"column:urlencoded;default:'[]'"`
	TextBody       string         `gorm:"column:textbody"`
	BinaryBody     datatypes.JSON `gorm:"column:binarybody"`

	AuthEnabled bool           `gorm:"column:authEnabled;default:false"`
	AuthType    string         `gorm:"column:authType;default:no_auth"`
	BasicAuth   datatypes.JSON `gorm:"column:basicAuth"`
	ApiKeyAuth  datatypes.JSON `gorm:"column:apiKeyAuth"`
	TokenAuth   datatypes.JSON `gorm:"column:tokenAuth"`
}

func (r RequestCore) ToRequestCoreDTO() models.RequestCoreDTO {
	return models.RequestCoreDTO{
		Url:                r.Url,
		Method:             r.Method,
		Query:              string(r.Query),
		Headers:            string(r.Headers),
		Cookies:            string(r.Cookies),
		Path:               string(r.Path),
		MultipartFormBody:  string(r.MultipartForm),
		UrlEncodedFormBody: string(r.UrlEncodedForm),
		TextBody:           r.TextBody,
		BinaryBody:         string(r.BinaryBody),
		BodyType:           r.BodyType,
		AuthType:           r.AuthType,
		AuthEnabled:        r.AuthEnabled,
		BasicAuth:          string(r.BasicAuth),
		ApiKeyAuth:         string(r.ApiKeyAuth),
		TokenAuth:          string(r.TokenAuth),
	}
}

func (r RequestCore) FromRequestCoreDTO(dto models.RequestCoreDTO) RequestCore {
	return RequestCore{
		Url:     dto.Url,
		Method:  dto.Method,
		Query:   datatypes.JSON([]byte(dto.Query)),
		Path:    datatypes.JSON([]byte(dto.Path)),
		Headers: datatypes.JSON([]byte(dto.Headers)),
		Cookies: datatypes.JSON([]byte(dto.Cookies)),

		BodyType:       dto.BodyType,
		TextBody:       dto.TextBody,
		UrlEncodedForm: datatypes.JSON([]byte(dto.UrlEncodedFormBody)),
		MultipartForm:  datatypes.JSON([]byte(dto.MultipartFormBody)),
		BinaryBody:     datatypes.JSON([]byte(dto.BinaryBody)),

		//auth
		ApiKeyAuth:  datatypes.JSON([]byte(dto.ApiKeyAuth)),
		BasicAuth:   datatypes.JSON([]byte(dto.BasicAuth)),
		TokenAuth:   datatypes.JSON([]byte(dto.TokenAuth)),
		AuthType:    dto.AuthType,
		AuthEnabled: dto.AuthEnabled,
	}
}
