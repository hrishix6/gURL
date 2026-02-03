package models

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
