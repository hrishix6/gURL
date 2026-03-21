package models

type CollectionDTO struct {
	Id   string `json:"id"`
	Name string `json:"name"`
}

type CreateCollectionDTO struct {
	Id        string `json:"id"`
	Name      string `json:"name"`
	Workspace string `json:"workspaceId"`
}
