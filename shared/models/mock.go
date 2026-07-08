package models

type MockCoreDTO struct {
	Method          string `json:"method"`
	Path            string `json:"path"`
	EnvironmentId   string `json:"environmentId"`
	ResponseStatus  int64  `json:"status"`
	ResponseDelayS  int64  `json:"delayS"`
	ResponseHeaders string `json:"headers"`
	BodyType        string `json:"bodyType"`
	TextBody        string `json:"text"`
	BinaryBody      string `json:"binary"`
}

type MockLightDTO struct {
	Id           string `json:"id"`
	Name         string `json:"name"`
	Path         string `json:"path"`
	Method       string `json:"method"`
	CollectionId string `json:"collectionId"`
}

type DraftMockInfo struct {
	Name string `json:"name"`
}

type CreateMockDTO struct {
	Id string `json:"id"`
}

type MockQueryDTO struct {
	WorkspaceId  string `json:"workspaceId"`
	CollectionId string `json:"collectionId"`
}

type MockDraftDTO struct {
	MockCoreDTO
	Id                 string `json:"id"`
	ParentMockId       string `json:"parentMockId"`
	ParentMockName     string `json:"parentMockName"`
	ParentCollectionId string `json:"parentCollectionId"`

	CollectionInfo *DraftCollectionInfo `json:"collectionInfo"`
}

type UpdateMockDraftFields struct {
	Method  *string `json:"method"`
	Path    *string `json:"path"`
	Headers *string `json:"headersJson"`
	Cookies *string `json:"cookiesJson"`

	BodyType   *string `json:"bodyType"`
	TextBody   *string `json:"text"`
	BinaryBody *string `json:"binaryJson"`

	Status *int64 `json:"status"`
	DelayS *int64 `json:"delayS"`

	EnvironmentId *string `json:"environmentId"`
}

type SaveMockDraftAsMock struct {
	MockId       string `json:"mockId"`
	CollectionId string `json:"collectionId"`
	Name         string `json:"name"`
	WorkspaceId  string `json:"workspaceId"`
}
