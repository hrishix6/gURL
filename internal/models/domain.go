package models

import (
	"encoding/json"
	"slices"
	"strings"
)

type AppConfig struct {
	Mode       string `json:"mode"`
	BackendURL string `json:"backend_url"`
}

type GurlKeyValItem struct {
	Id      string `json:"id"`
	Key     string `json:"key"`
	Value   string `json:"val"`
	Enabled string `json:"enabled"`
}

type GurlKeyValMultiPartItem struct {
	Id      string `json:"id"`
	Key     string `json:"key"`
	Value   string `json:"value"`
	Enabled string `json:"enabled"`
	IsFile  bool   `json:"isFile"`
}

type TempStorageStats struct {
	TempFileName      string
	TempFilePath      string
	Size              int64
	TimeToStoredMs    int64
	TempFileExtension string
	TempFileMimeType  string
	ReportedMimeType  string
	SizeLimitExceeded bool
}

type GurlReq struct {
	Id             string                    `json:"id"`
	Method         string                    `json:"method"`
	Url            string                    `json:"url"`
	BodyType       string                    `json:"bodyType"`
	Query          []GurlKeyValItem          `json:"query"`
	Headers        []GurlKeyValItem          `json:"headers"`
	Cookies        []GurlKeyValItem          `json:"cookies"`
	UrlEncodedForm []GurlKeyValItem          `json:"urlencoded"`
	MultiPartForm  []GurlKeyValMultiPartItem `json:"multipart"`
	TextBody       string                    `json:"plaintext"`
	BinaryFile     string                    `json:"binary"`
	Auth           GurlAuth                  `json:"auth"`
}

type GurlAuth struct {
	AuthEnabled bool       `json:"authEnabled"`
	AuthType    string     `json:"authType"`
	BasicAuth   BasicAuth  `json:"basicAuth"`
	ApiKeyAuth  ApiKeyAuth `json:"apiKeyAuth"`
	TokenAuth   TokenAuth  `json:"tokenAuth"`
}

type BasicAuth struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type ApiKeyAuth struct {
	Key      string `json:"key"`
	Value    string `json:"value"`
	Location string `json:"location"`
}

type TokenAuth struct {
	Type  string `json:"type"`
	Token string `json:"token"`
}

type GurlRenderMeta struct {
	Html5Element     string `json:"html5Element"`
	Src              string `json:"src"`
	CanRender        bool   `json:"canRender"`
	Filepath         string `json:"filepath"`
	Filename         string `json:"filename"`
	DetectedMimeType string `json:"detectedMimeType"`
	ReportedMimeType string `json:"reportedMimeType"`
	Extension        string `json:"extension"`
}

type GurlRes struct {
	Id                string           `json:"id"`
	StatusCode        int              `json:"status"`
	StatusText        string           `json:"statusText"`
	Success           bool             `json:"success"`
	ReqHeaders        []GurlKeyValItem `json:"reqHeaders"`
	ResHeaders        []GurlKeyValItem `json:"resHeaders"`
	Body              *GurlRenderMeta  `json:"body"`
	Cookies           []GurlResCookie  `json:"cookies"`
	SizeBytes         int64            `json:"size"`
	UploadBytes       int64            `json:"uploadSize"`
	TimeMs            int64            `json:"time"`
	TimeToFirstByteMs int64            `json:"ttfbMs"`
	DownloadMs        int64            `json:"dlMs"`
	LimitExceeded     bool             `json:"limitExceeded"`
	ReportedSizeBytes int64            `json:"reportedSize"`
	SizeNotReported   bool             `json:"sizeNotReported"`
}

type GurlResCookie struct {
	Name     string `json:"name"`
	Value    string `json:"value"`
	Path     string `json:"path"`
	Domain   string `json:"domain"`
	Expires  string `json:"expires"`
	MaxAge   int    `json:"maxAge"`
	Secure   bool   `json:"secure"`
	HttpOnly bool   `json:"httpOnly"`
	SameSite int    `json:"sameSite"`
	Raw      string `json:"raw"`
}

type GurlBodyType string

const (
	NoBodyType             GurlBodyType = "none"
	JsonBodyType           GurlBodyType = "json"
	TextBodyType           GurlBodyType = "plaintext"
	XmlBodyType            GurlBodyType = "xml"
	BinaryBodyType         GurlBodyType = "binary"
	UrlEncodedFormBodyType GurlBodyType = "urlencoded"
	MultipartFormBodyType  GurlBodyType = "multipart"
)

func ValidateOrDefaultBodyType(arg string, def GurlBodyType) GurlBodyType {

	if arg == "" {
		return def
	}

	validItems := []GurlBodyType{
		NoBodyType,
		JsonBodyType,
		TextBodyType,
		XmlBodyType,
		BinaryBodyType,
		UrlEncodedFormBodyType,
		MultipartFormBodyType,
	}

	i := slices.Index(validItems, GurlBodyType(arg))

	if i == -1 {
		return def
	}

	return validItems[i]
}

type GurlAuthType string

const (
	NoAuthType     GurlAuthType = "no_auth"
	BasicAuthType  GurlAuthType = "basic"
	ApiKeyAuthType GurlAuthType = "api_key"
	TokenAuthType  GurlAuthType = "token"
)

func ValidateOrDefaultAuthType(arg string, def GurlAuthType) GurlAuthType {
	switch arg {
	case string(NoAuthType):
		return NoAuthType
	case string(BasicAuthType):
		return BasicAuthType
	case string(ApiKeyAuthType):
		return ApiKeyAuthType
	case string(TokenAuthType):
		return TokenAuthType
	default:
		return def
	}
}

type ExportedKeyValItem struct {
	K string `json:"key"`
	V string `json:"value"`
}

type ExportedMultipartItem struct {
	K      string `json:"key"`
	V      string `json:"value"`
	IsFile bool   `json:"is_file"`
}

type ExportedGurlCollection struct {
	Version  string            `json:"version"`
	Name     string            `json:"name"`
	Requests []ExportedGurlReq `json:"requests"`
}

type ExportedGurlReq struct {
	Version        string                  `json:"version"`
	Name           string                  `json:"name"`
	Url            string                  `json:"url"`
	Method         string                  `json:"method"`
	Cookies        []ExportedKeyValItem    `json:"cookies"`
	Headers        []ExportedKeyValItem    `json:"headers"`
	QueryParams    []ExportedKeyValItem    `json:"query"`
	PathParams     []ExportedKeyValItem    `json:"path"`
	BodyType       GurlBodyType            `json:"body_type"`
	TextBody       string                  `json:"text"`
	UrlEncodedBody []ExportedKeyValItem    `json:"urlencoded"`
	MultipartBody  []ExportedMultipartItem `json:"multipart"`
	BinaryBody     string                  `json:"binary"`
	AuthType       GurlAuthType            `json:"auth_type"`
	BasicAuth      BasicAuth               `json:"basic"`
	ApiKeyAuth     ApiKeyAuth              `json:"api_key"`
	TokenAuth      TokenAuth               `json:"token"`
}

type GurlReqMethod string

const (
	GET     GurlReqMethod = "GET"
	POST    GurlReqMethod = "POST"
	PUT     GurlReqMethod = "PUT"
	PATCH   GurlReqMethod = "PATCH"
	DELETE  GurlReqMethod = "DELETE"
	HEAD    GurlReqMethod = "HEAD"
	OPTIONS GurlReqMethod = "OPTIONS"
)

func ValidOrDefaultMethod(method string) GurlReqMethod {
	switch strings.ToUpper(method) {
	case "GET":
		return GET
	case "POST":
		return POST
	case "PUT":
		return PUT
	case "PATCH":
		return PATCH
	case "DELETE":
		return DELETE
	case "HEAD":
		return HEAD
	case "OPTIONS":
		return OPTIONS
	default:
		return GET
	}
}

type ImportedCollection struct {
	Version  *string         `json:"version"`
	Name     *string         `json:"name"`
	Requests json.RawMessage `json:"requests"`
}

type ImportedGurlReq struct {
	Version        *string         `json:"version"`
	Name           *string         `json:"name"`
	Url            *string         `json:"url"`
	Method         *string         `json:"method"`
	Cookies        json.RawMessage `json:"cookies"`
	Headers        json.RawMessage `json:"headers"`
	QueryParams    json.RawMessage `json:"query"`
	PathParams     json.RawMessage `json:"path"`
	BodyType       *string         `json:"body_type"`
	TextBody       *string         `json:"text"`
	UrlEncodedBody json.RawMessage `json:"urlencoded"`
	MultipartBody  json.RawMessage `json:"multipart"`
	BinaryBody     *string         `json:"binary"`
	AuthType       *string         `json:"auth_type"`
	BasicAuth      json.RawMessage `json:"basic"`
	ApiKeyAuth     json.RawMessage `json:"api_key"`
	TokenAuth      json.RawMessage `json:"token"`
}

type ExportedEnvironmentItem struct {
	K           string `json:"key"`
	V           string `json:"value"`
	IsSecret    bool   `json:"is_secret"`
	Description string `json:"description"`
}

type ExportedEnvironment struct {
	Version string                    `json:"version"`
	Name    string                    `json:"name"`
	Vars    []ExportedEnvironmentItem `json:"vars"`
}

type ImportedEnvironment struct {
	Version *string         `json:"version"`
	Name    *string         `json:"name"`
	Vars    json.RawMessage `json:"vars"`
}

type SavedResponseRenderMeta struct {
	Html5Element string `json:"html5Element"`
	Src          string `json:"src"`
	CanRender    bool   `json:"canRender"`
	Filepath     string `json:"filepath"`
	Extension    string `json:"extension"`
}
