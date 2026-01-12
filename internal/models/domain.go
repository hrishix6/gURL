package models

type GurlKeyValItem struct {
	Key     string `json:"key"`
	Value   string `json:"value"`
	Enabled bool   `json:"enabled"`
}

type GurlKeyValMultiPartItem struct {
	Key     string `json:"key"`
	Value   string `json:"value"`
	Enabled bool   `json:"enabled"`
	IsFile  bool   `json:"isFile"`
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

type TempStorageStats struct {
	TempFilePath      string
	Size              int64
	TimeToStoredMs    int64
	TempFileExtension string
	TempFileMimeType  string
	ReportedMimeType  string
	SizeLimitExceeded bool
}

type GurlReq struct {
	Id             string                    `json:"id"`
	Method         string                    `json:"method"`
	Url            string                    `json:"url"`
	BodyType       string                    `json:"bodyType"`
	Query          []GurlKeyValItem          `json:"query"`
	Headers        []GurlKeyValItem          `json:"headers"`
	Cookies        []GurlKeyValItem          `json:"cookies"`
	UrlEncodedForm []GurlKeyValItem          `json:"urlencoded"`
	MultiPartForm  []GurlKeyValMultiPartItem `json:"multipart"`
	TextBody       string                    `json:"plaintext"`
	BinaryFile     string                    `json:"binary"`
}

type GurlRenderMeta struct {
	Html5Element     string `json:"html5Element"`
	Src              string `json:"src"`
	CanRender        bool   `json:"canRender"`
	Filepath         string `json:"filepath"`
	DetectedMimeType string `json:"detectedMimeType"`
	ReportedMimeType string `json:"reportedMileType"`
	Extension        string `json:"extension"`
}

type GurlRes struct {
	Id                string           `json:"id"`
	StatusCode        int              `json:"status"`
	StatusText        string           `json:"statusText"`
	Success           bool             `json:"success"`
	Headers           []GurlKeyValItem `json:"headers"`
	Body              *GurlRenderMeta  `json:"body"`
	Cookies           []GurlResCookie  `json:"cookies"`
	IsFile            bool             `json:"isFile"`
	SizeBytes         int64            `json:"size"`
	UploadBytes       int64            `json:"uploadSize"`
	TimeMs            int64            `json:"time"`
	TimeToFirstByteMs int64            `json:"ttfbMs"`
	DownloadMs        int64            `json:"dlMs"`
	LimitExceeded     bool             `json:"limitExceeded"`
	ReportedSizeBytes int64            `json:"reportedSize"`
	SizeNotReported   bool             `json:"sizeNotReported"`
}

type GurlResCookie struct {
	Name     string `json:"name"`
	Value    string `json:"value"`
	Path     string `json:"path"`
	Domain   string `json:"domain"`
	Expires  string `json:"expires"`
	MaxAge   int    `json:"maxAge"`
	Secure   bool   `json:"secure"`
	HttpOnly bool   `json:"httpOnly"`
	SameSite int    `json:"sameSite"`
	Raw      string `json:"raw"`
}
