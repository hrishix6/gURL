package models

type CollectionDTO struct {
	Id                string `json:"id"`
	Name              string `json:"name"`
	MockServerEnabled bool   `json:"mockServerEnabled"`
	MockServerKey     string `json:"mockServerKey"`
}

type CreateCollectionDTO struct {
	Id        string `json:"id"`
	Name      string `json:"name"`
	Workspace string `json:"workspaceId"`
}

type RenameCollectionDTO struct {
	Name string `json:"name"`
}

type CollectionsQueryDTO struct {
	WorkspaceId string `json:"workspaceId"`
}

type CreateMockServerDTO struct {
	WorkspaceId  string `json:"workspaceId"`
	CollectionId string `json:"collectionId"`
}
