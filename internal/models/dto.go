package models

import (
	"encoding/json"
)

type RequestDraftDTO struct {
	Id                 string `json:"id"`
	Url                string `json:"url"`
	Method             string `json:"method"`
	Query              string `json:"query"`
	Headers            string `json:"headers"`
	Cookies            string `json:"cookies"`
	BodyType           string `json:"bodyType"`
	MultipartFormBody  string `json:"multipart"`
	UrlEncodedFormBody string `json:"urlencoded"`
	TextBody           string `json:"text"`
	BinaryBody         string `json:"binary"`
	AuthEnabled        bool   `json:"authEnabled"`
	AuthType           string `json:"authType"`
	BasicAuth          string `json:"basicAuth"`
	ApiKeyAuth         string `json:"apiKeyAuth"`
	TokenAuth          string `json:"tokenAuth"`
	ParentRequestId    string `json:"parentRequestId"`
	ParentRequestName  string `json:"parentRequestName"`
	ParentCollectionId string `json:"parentCollectionId"`
}

type RequestDTO struct {
	Id                 string `json:"id"`
	Url                string `json:"url"`
	Name               string `json:"name"`
	Method             string `json:"method"`
	Query              string `json:"query"`
	Headers            string `json:"headers"`
	Cookies            string `json:"cookies"`
	BodyType           string `json:"bodyType"`
	MultipartFormBody  string `json:"multipart"`
	UrlEncodedFormBody string `json:"urlencoded"`
	TextBody           string `json:"text"`
	BinaryBody         string `json:"binary"`
	AuthEnabled        bool   `json:"authEnabled"`
	AuthType           string `json:"authType"`
	BasicAuth          string `json:"basicAuth"`
	ApiKeyAuth         string `json:"apiKeyAuth"`
	TokenAuth          string `json:"tokenAuth"`
	CollectionId       string `json:"collectionId"`
}

type RequestLightDTO struct {
	Id           string `json:"id"`
	Name         string `json:"name"`
	Method       string `json:"method"`
	Url          string `json:"url"`
	CollectionId string `json:"collectionId"`
}

type ReqExampleDTO struct {
	Id           string `json:"id"`
	RequestId    string `json:"requestId"`
	CollectionId string `json:"collectionId"`
	Name         string `json:"name"`

	// Request Data
	Url            string `json:"url"`
	Method         string `json:"method"`
	Query          string `json:"query"`
	Headers        string `json:"headers"`
	Cookies        string `json:"cookies"`
	MultipartForm  string `json:"multipart"`
	UrlEncodedForm string `json:"urlencoded"`
	TextBody       string `json:"text"`
	BinaryBody     string `json:"binary"`
	BodyType       string `json:"bodyType"`
	UploadSize     int64  `json:"uploadSize"`

	// Response Data
	ResponseSuccess    bool   `json:"responseSuccess"`
	ResponseStatus     int64  `json:"responseStatus"`
	ResponseStatusText string `json:"responseStatusText"`
	ResponseTime       int64  `json:"responseTimeMS"`
	SentHeaders        string `json:"sentHeaders"`
	ResponseHeaders    string `json:"responseHeaders"`
	ResponseCookies    string `json:"responseCookies"`
	ResponseBody       string `json:"responseBody"`

	ResponseSize   int64 `json:"responseSize"`
	LimitExceeded  bool  `json:"limitExceeded"`
	ResponseTffbMs int64 `json:"responseTffbMs"`
	ResponseDlMs   int64 `json:"responseDlMs"`

	// Auth Data
	AuthType   string `json:"authType"`
	BasicAuth  string `json:"basicAuth"`
	ApiKeyAuth string `json:"apiKeyAuth"`
	TokenAuth  string `json:"tokenAuth"`
}

type ReqExampleLightDTO struct {
	Id        string `json:"id"`
	RequestId string `json:"requestId"`
	Name      string `json:"name"`
}

type AddFreshDraftDTO struct {
	Id string `json:"id"`
}

type AddDraftFromRequestDTO struct {
	Id        string `json:"id"`
	RequestId string `json:"requestId"`
}

type UpdateDraftUrlDTO struct {
	RequestId string `json:"requestId"`
	Url       string `json:"url"`
}

type UpdateDraftQueryDTO struct {
	RequestId string `json:"requestId"`
	QueryJSON string `json:"queryJson"`
}

type UpdateDraftCookiesDTO struct {
	RequestId   string `json:"requestId"`
	CookiesJSON string `json:"cookiesJSON"`
}

type UpdateDraftHeadersDTO struct {
	RequestId   string `json:"requestId"`
	HeadersJSON string `json:"headersJson"`
}

type UpdateDraftMultipartFormDTO struct {
	RequestId     string `json:"requestId"`
	MultipartJSON string `json:"multipartJson"`
}

type UpdateDraftUrlEncodedFormDTO struct {
	RequestId          string `json:"requestId"`
	UrlEncodedFormJSON string `json:"urlencodedJson"`
}

type UpdateDraftTextBodyDTO struct {
	RequestId string `json:"requestId"`
	TextBody  string `json:"textBody"`
}

type UpdateDraftBinaryBodyDTO struct {
	RequestId      string `json:"requestId"`
	BinaryBodyJSON string `json:"binaryJson"`
}

type UpdateDraftMethodDTO struct {
	RequestId string `json:"requestId"`
	Method    string `json:"method"`
}

type UpdateDraftBodyTypeDTO struct {
	RequestId string `json:"requestId"`
	BodyType  string `json:"bodyType"`
}

type UpdateDraftCollectionDTO struct {
	RequestId    string `json:"requestId"`
	CollectionId string `json:"collectionId"`
}

type UpdateOpenTabsDTO struct {
	OpenTabsJSON string `json:"openTabsJson"`
}

type AddCollectionDTO struct {
	Id   string `json:"id"`
	Name string `json:"name"`
}

type CollectionDTO struct {
	Id   string `json:"id"`
	Name string `json:"name"`
}

type SaveDraftAsReqDTO struct {
	DraftId      string `json:"draftId"`
	RequestId    string `json:"requestId"`
	CollectionId string `json:"collectionId"`
	Name         string `json:"name"`
}

type UIStateDTO struct {
	OpenTabs               string `json:"openTabsJson"`
	Layout                 string `json:"layout"`
	ActiveTab              string `json:"activeTab"`
	IsSidebarOpen          bool   `json:"isSidebarOpen"`
	AlwaysDiscard          bool   `json:"alwaysDiscardDrafts"`
	AlwaysDiscardEnvDrafts bool   `json:"alwaysDiscardEnvDrafts"`
}

type SaveRequestCopyDTO struct {
	SourceId string `json:"sourceId"`
	Id       string `json:"id"`
	Name     string `json:"name"`
}

// auth
type UpdateDraftBasicAuthDTO struct {
	RequestId     string `json:"requestId"`
	BasicAuthJSON string `json:"basicAuthJSON"`
}
type UpdateDraftApiKeyAuthDTO struct {
	RequestId      string `json:"requestId"`
	ApiKeyAuthJSON string `json:"apiKeyAuthJSON"`
}
type UpdateDraftTokenAuthDTO struct {
	RequestId     string `json:"requestId"`
	TokenAuthJSON string `json:"tokenAuthJSON"`
}

type UpdateDraftAuthEnabledDTO struct {
	RequestId   string `json:"requestId"`
	AuthEnabled bool   `json:"authEnabled"`
}

type UpdateDraftAuthTypeDTO struct {
	RequestId string `json:"requestId"`
	AuthType  string `json:"authType"`
}

type EnvironmentDraftDTO struct {
	Id            string `json:"id"`
	Name          string `json:"name"`
	Data          string `json:"dataJSON"`
	ParentEnvId   string `json:"parentEnvId"`
	ParentEnvName string `json:"parentEnvName"`
}

type EnvironmentDTO struct {
	Id   string `json:"id"`
	Name string `json:"name"`
	Data string `json:"dataJSON"`
}

type AddEnvironmentDTO struct {
	Id   string `json:"id"`
	Name string `json:"name"`
}

type AddEnvironmentDraftDTO struct {
	DraftId string `json:"draftId"`
	EnvId   string `json:"envId"`
}

type UpdateEnvDraftDataDTO struct {
	DraftId  string `json:"draftId"`
	DataJSON string `json:"dataJSON"`
}

type SaveEnvDraftAsEnvDTO struct {
	DraftId string `json:"draftId"`
	EnvId   string `json:"envId"`
	Name    string `json:"name"`
}

type KeyValItem struct {
	Id      string `json:"id"`
	Key     string `json:"key"`
	Val     string `json:"val"`
	Enabled string `json:"enabled"`
}

type MultipartKeyValItem struct {
	Id      string          `json:"id"`
	Key     string          `json:"key"`
	Val     json.RawMessage `json:"val"`
	Enabled string          `json:"enabled"`
}

func (mkv MultipartKeyValItem) ValAsStr() (string, bool) {
	var v string
	if err := json.Unmarshal(mkv.Val, &v); err == nil {
		return v, true
	}

	return "", false
}

func (mkv MultipartKeyValItem) ValAsFileStats() (*FileStats, bool) {

	var o FileStats

	if err := json.Unmarshal(mkv.Val, &o); err == nil {
		return &o, true
	}

	return nil, false
}
