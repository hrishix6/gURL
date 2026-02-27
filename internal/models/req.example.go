package models

type ReqExampleDTO struct {
	RequestCoreDTO
	Id           string `json:"id"`
	RequestId    string `json:"requestId"`
	CollectionId string `json:"collectionId"`
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
}

type ReqExampleLightDTO struct {
	Id        string `json:"id"`
	RequestId string `json:"requestId"`
	Name      string `json:"name"`
}
