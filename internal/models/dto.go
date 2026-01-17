package models

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

type AddFreshDraftDTO struct {
	Id string `json:"id"`
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
	OpenTabs      string `json:"openTabsJson"`
	Layout        string `json:"layout"`
	ActiveTab     string `json:"activeTab"`
	IsSidebarOpen bool   `json:"isSidebarOpen"`
	AlwaysDiscard bool   `json:"alwaysDiscardDrafts"`
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
