package models

type RequestDTO struct {
	Id                 string `json:"id"`
	Url                string `json:"url"`
	Method             string `json:"method"`
	Query              string `json:"query"`
	Headers            string `json:"headers"`
	BodyType           string `json:"bodyType"`
	MultipartFormBody  string `json:"multipart"`
	UrlEncodedFormBody string `json:"urlencoded"`
	TextBody           string `json:"text"`
	BinaryBody         string `json:"binary"`
	CollectionId       string `json:"collectionId"`
}

type AddReqDTO struct {
	Id           string `json:"id"`
	CollectionId string `json:"collectionId"`
}

type UpdateReqUrlDTO struct {
	RequestId string `json:"requestId"`
	Url       string `json:"url"`
}

type UpdateReqQueryDTO struct {
	RequestId string `json:"requestId"`
	QueryJSON string `json:"queryJson"`
}

type UpdateReqHeadersDTO struct {
	RequestId   string `json:"requestId"`
	HeadersJSON string `json:"headersJson"`
}

type UpdateReqMultipartFormDTO struct {
	RequestId     string `json:"requestId"`
	MultipartJSON string `json:"multipartJson"`
}

type UpdateReqUrlEncodedFormDTO struct {
	RequestId          string `json:"requestId"`
	UrlEncodedFormJSON string `json:"urlencodedJson"`
}

type UpdateReqTextBodyDTO struct {
	RequestId string `json:"requestId"`
	TextBody  string `json:"textBody"`
}

type UpdateReqBinaryBodyDTO struct {
	RequestId      string `json:"requestId"`
	BinaryBodyJSON string `json:"binaryJson"`
}

type UpdateReqMethodDTO struct {
	RequestId string `json:"requestId"`
	Method    string `json:"method"`
}

type UpdateReqBodyTypeDTO struct {
	RequestId string `json:"requestId"`
	BodyType  string `json:"bodyType"`
}

type UpdateReqCollectionDTO struct {
	RequestId    string `json:"requestId"`
	CollectionId string `json:"collectionId"`
}

//tabs

type UpdateOpenTabsDTO struct {
	OpenTabsJSON string `json:"openTabsJson"`
}
