package models

type GurlKeyValItem struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

type GurlKeyValMultiPartItem struct {
	Key    string `json:"key"`
	Value  string `json:"value"`
	IsFile bool   `json:"isFile"`
}

type MimeData struct {
	Source       string   `json:"source"`
	Extensions   []string `json:"extensions"`
	Compressible *bool    `json:"compressible"`
	Charset      string   `json:"charset"`
}

type FileStats struct {
	Name string `json:"name"`
	Size int64  `json:"size"`
	Path string `json:"path"`
}
