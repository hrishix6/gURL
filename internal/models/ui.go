package models

type UIStateDTO struct {
	OpenTabs               string `json:"openTabsJson"`
	Layout                 string `json:"layout"`
	ActiveTab              string `json:"activeTab"`
	IsSidebarOpen          bool   `json:"isSidebarOpen"`
	AlwaysDiscard          bool   `json:"alwaysDiscardDrafts"`
	AlwaysDiscardEnvDrafts bool   `json:"alwaysDiscardEnvDrafts"`
}

type UpdateUIStateDTO struct {
	Layout                 *string `json:"layout"`
	OpenTabsJSON           *string `json:"openTabsJson"`
	IsSidebarOpen          *bool   `json:"isSidebarOpen"`
	ActiveTabId            *string `json:"activeTabId"`
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
	Id      string    `json:"id"`
	Key     string    `json:"key"`
	Value   FileStats `json:"val"`
	Enabled string    `json:"enabled"`
}

type UIEnvironmentItem struct {
	Id          string `json:"id"`
	Key         string `json:"key"`
	Value       string `json:"val"`
	IsSecret    bool   `json:"isSecret"`
	Description string `json:"description"`
}
