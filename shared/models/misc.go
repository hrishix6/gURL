package models

import (
	"gorm.io/gorm"
)

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

type AppInitParams struct {
	Db                *gorm.DB
	AppName           string
	SavedResponsesDir string
	TempDir           string
	Env               string
}

type WebAppInitParams struct {
	AppInitParams
	WebTempDir string
	BaseURL    string
	Port       int
}

type GurlClientConfig struct {
	Mode       string `json:"mode"`
	BackendURL string `json:"backend_url"`
	AppVersion string `json:"appVersion"`
}

type ParseCookieTextDTO struct {
	Text string `json:"cookie"`
}

type GetSavedResponseSrcDTO struct {
	SavedResPath string `json:"saved_res_path"`
}

type UploadWebTempFileRes struct {
	Success bool
	ErrMsg  string
	Data    string
}

type DownloadTmpFileDTO struct {
	Path     string `json:"file_path"`
	Name     string `json:"file_name"`
	MimeType string `json:"file_mimetype"`
}

type WebImportDTO struct {
	WorkspaceId string `json:"workspace_id"`
	Filepath    string `json:"file_path"`
}
