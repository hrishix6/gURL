package models

type ReqExampleDTO struct {
	RequestCoreDTO
	Id           string `json:"id"`
	RequestId    string `json:"requestId"`
	CollectionId string `json:"collectionId"`
	WorkspaceId  string `json:"workspaceId"`
	Name         string `json:"name"`

	UploadSize         int64  `json:"uploadSize"`
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

	//for breadcrumbs
	RequestInfo    *DraftRequestInfo    `json:"requestInfo"`
	CollectionInfo *DraftCollectionInfo `json:"collectionInfo"`
}

type ReqExampleLightDTO struct {
	Id           string `json:"id"`
	RequestId    string `json:"requestId"`
	Method       string `json:"method"`
	Name         string `json:"name"`
	CollectionId string `json:"collectionId"`
	Url          string `json:"url"`
}

type AddRequestExampleDTO struct {
	Example        ReqExampleDTO           `json:"example"`
	RenderMetadata SavedResponseRenderMeta `json:"metadata"`
}

type ReqExampleQueryDTO struct {
	WorkspaceId  string `json:"workspaceId"`
	CollectionId string `json:"collectionId"`
}
