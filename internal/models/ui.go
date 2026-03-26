package models

type UIStateDTO struct {
	Layout                 string `json:"layout"`
	IsSidebarOpen          bool   `json:"isSidebarOpen"`
	AlwaysDiscard          bool   `json:"alwaysDiscardDrafts"`
	AlwaysDiscardEnvDrafts bool   `json:"alwaysDiscardEnvDrafts"`
	ActiveWorkspace        string `json:"activeWorkspace"`
}

type UpdateUIStateDTO struct {
	Layout                 *string `json:"layout"`
	IsSidebarOpen          *bool   `json:"isSidebarOpen"`
	ActiveWorkspace        *string `json:"activeWorkspace"`
	AlwaysDiscardReqDrafts *bool   `json:"alwaysDiscardReqDrafts"`
	AlwaysDiscardEnvDrafts *bool   `json:"alwaysDiscardEnvDrafts"`
}

type UIKeyValueItem struct {
	Id      string `json:"id"`
	Key     string `json:"key"`
	Value   string `json:"val"`
	Enabled string `json:"enabled"`
}

type UIMultipartKeyValueItem struct {
	Id      string `json:"id"`
	Key     string `json:"key"`
	Value   string `json:"val"`
	Enabled string `json:"enabled"`
}

type UIMultipartFileItem struct {
	Id      string     `json:"id"`
	Key     string     `json:"key"`
	Value   *FileStats `json:"val"`
	Enabled string     `json:"enabled"`
}

type UIEnvironmentItem struct {
	Id          string `json:"id"`
	Key         string `json:"key"`
	Value       string `json:"val"`
	IsSecret    bool   `json:"isSecret"`
	Description string `json:"description"`
}
