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
	WebTempDir  string
	BackendURL  string
	FrontendURL string
	Port        int
}

type GurlClientConfig struct {
	Mode           string `json:"mode"`
	ApiBaseURL     string `json:"api_url"`
	AuthBaseURL    string `json:"auth_url"`
	AppVersion     string `json:"appVersion"`
	SetupRequired  bool   `json:"setup_required"`
	DemoEnabled    bool   `json:"demo_enabled"`
	Env            string `json:"env"`
	Deployment     string `json:"deployment"`
	MockSrvBaseURL string `json:"mockSrvBaseUrl"`
}

type ParseCookieTextDTO struct {
	Text string `json:"cookie"`
}

type GetSavedResponseSrcDTO struct {
	Name string `json:"file_name"`
}

type UploadWebTempFileRes struct {
	Success bool
	ErrMsg  string
	Data    string
}

type DownloadTmpFileDTO struct {
	Name     string `json:"file_name"`
	MimeType string `json:"file_mimetype"`
}

type WebImportDTO struct {
	WorkspaceId string `json:"workspace_id"`
	Filepath    string `json:"file_path"`
}

type WebHttpReqConfigPayload struct {
	Req   GurlReq `json:"req"`
	EnvId string  `json:"envId"`
}
