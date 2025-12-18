package models

type GurlBody struct {
	IsText      bool   `json:"isText"`
	Filepath    string `json:"filepath"`
	SuggestName string `json:"suggestedName"`
	Extension   string `json:"extension"`
	TextContent string `json:"textContent"`
}

type GurlRes struct {
	Id         string           `json:"id"`
	StatusCode int              `json:"status"`
	StatusText string           `json:"statusText"`
	Success    bool             `json:"success"`
	Headers    []GurlKeyValItem `json:"headers"`
	Body       *GurlBody        `json:"body"`
	IsFile     bool             `json:"isFile"`
	SizeBytes  int64            `json:"size"`
	TimeMs     int64            `json:"time"`
}
