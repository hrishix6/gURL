package models

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
	Id          string `json:"id"`
	Name        string `json:"name"`
	WorkspaceId string `json:"workspaceId"`
	Data        string `json:"dataJSON"`
}

type AddEnvironmentDraftDTO struct {
	DraftId string `json:"draftId"`
	EnvId   string `json:"envId"`
}

type CopyEnvironmentDTO struct {
	Id string `json:"id"`
}

type UpdateEnvDraftDataDTO struct {
	DataJSON string `json:"dataJSON"`
}

type SaveEnvDraftAsEnvDTO struct {
	EnvId       string `json:"envId"`
	Name        string `json:"name"`
	WorkspaceId string `json:"workspaceId"`
}
