package models

type WorkspaceDTO struct {
	Id           string `json:"id"`
	Name         string `json:"name"`
	OpenTabsJSON string `json:"openTabsJSON"`
	ActiveTab    string `json:"activeTab"`
}

type CreateWorkspaceDTO struct {
	Id   string `json:"id"`
	Name string `json:"name"`
}

type UpdateWorkspaceDTO struct {
	Name         *string `json:"name"`
	ActiveTab    *string `json:"activeTab"`
	OpenTabsJSON *string `json:"openTabsJSON"`
}

type WorkspaceLightDTO struct {
	Id   string `json:"id"`
	Name string `json:"name"`
}
