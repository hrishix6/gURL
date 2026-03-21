package models

type RequestCoreDTO struct {
	Url                string `json:"url"`
	Method             string `json:"method"`
	Query              string `json:"query"`
	Path               string `json:"path"`
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
}

type RequestDraftDTO struct {
	RequestCoreDTO
	Id                 string `json:"id"`
	ParentRequestId    string `json:"parentRequestId"`
	ParentRequestName  string `json:"parentRequestName"`
	ParentCollectionId string `json:"parentCollectionId"`
}

type RequestDTO struct {
	RequestCoreDTO
	Id           string `json:"id"`
	Name         string `json:"name"`
	CollectionId string `json:"collectionId"`
}

type RequestLightDTO struct {
	Id           string `json:"id"`
	Name         string `json:"name"`
	Method       string `json:"method"`
	Url          string `json:"url"`
	CollectionId string `json:"collectionId"`
}

type AddFreshDraftDTO struct {
	Id string `json:"id"`
}

type AddDraftFromRequestDTO struct {
	Id        string `json:"id"`
	RequestId string `json:"requestId"`
}

type SaveDraftAsReqDTO struct {
	DraftId      string `json:"draftId"`
	RequestId    string `json:"requestId"`
	CollectionId string `json:"collectionId"`
	Name         string `json:"name"`
	WorkspaceId  string `json:"workspaceId"`
}

type UpdateDraftFieldsDTO struct {
	DraftId string  `json:"draftId"`
	Url     *string `json:"url"`
	Method  *string `json:"method"`
	Query   *string `json:"queryJson"`
	Path    *string `json:"pathJson"`
	Headers *string `json:"headersJson"`
	Cookies *string `json:"cookiesJson"`

	BodyType   *string `json:"bodyType"`
	TextBody   *string `json:"text"`
	BinaryBody *string `json:"binaryJson"`
	Multipart  *string `json:"multipartJson"`
	UrlEncoded *string `json:"urlencodedJson"`

	AuthType    *string `json:"authType"`
	AuthEnabled *bool   `json:"authEnabled"`
	BasicAuth   *string `json:"basicAuthJson"`
	ApiKeyAuth  *string `json:"apiKeyAuthJson"`
	TokenAuth   *string `json:"tokenAuthJson"`
}

type SaveRequestCopyDTO struct {
	SourceId string `json:"sourceId"`
	Id       string `json:"id"`
	Name     string `json:"name"`
}
