package transform

import (
	"bytes"
	"context"
	"fmt"
	"gurl/internal"
	"gurl/internal/db"
	"gurl/internal/models"
	"gurl/internal/utils"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"slices"
	"strconv"
	"strings"
	"time"

	"github.com/wailsapp/mimetype"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
	"gorm.io/gorm"
)

var PREVIEWABLE_IMAGE_MIME = []string{
	"image/png",
	"image/jpeg",
	"image/gif",
	"image/webp",
	"image/svg+xml",
}

type HttpTransformer struct {
	appCtx context.Context
	db     *gorm.DB
}

func NewHttpTransformer(db *gorm.DB, appCtx context.Context) *HttpTransformer {
	return &HttpTransformer{
		db:     db,
		appCtx: appCtx,
	}
}

func (htf *HttpTransformer) lookupMimeRecord(id string) (db.MimeRecord, error) {
	return gorm.G[db.MimeRecord](htf.db).Where("id = ?", id).First(htf.appCtx)
}

func (htf *HttpTransformer) toTextBody(r *models.GurlReq) io.Reader {
	return strings.NewReader(r.TextBody)
}

func (htf *HttpTransformer) toBinaryBody(r *models.GurlReq) (io.Reader, error) {
	f, err := os.Open(r.BinaryFile)

	if err != nil {
		return nil, err
	}

	return f, nil
}

func (htf *HttpTransformer) toURLEncodedFormData(r *models.GurlReq) (io.Reader, error) {
	f := url.Values{}

	for _, item := range r.UrlEncodedForm {
		if item.Enabled && item.Key != "" {
			f.Add(item.Key, item.Value)
		}
	}

	return strings.NewReader(f.Encode()), nil
}

func (htf *HttpTransformer) toMultipartFormData(r *models.GurlReq) (io.Reader, string, error) {
	var buf bytes.Buffer

	writer := multipart.NewWriter(&buf)

	for _, item := range r.MultiPartForm {

		if item.Enabled && item.Key != "" {

			if item.IsFile {

				f, err := os.Open(item.Value)

				if err != nil {
					return nil, "", err
				}

				fWriter, err := writer.CreateFormFile(item.Key, filepath.Base(item.Value))

				if err != nil {
					return nil, "", err
				}

				_, err = io.Copy(fWriter, f)

				if err != nil {
					return nil, "", err
				}

				f.Close()

			} else {

				writer.WriteField(item.Key, item.Value)
			}
		}

	}

	writer.Close()

	return &buf, writer.FormDataContentType(), nil
}

func (htf *HttpTransformer) prepareHttpBody(r *models.GurlReq) (io.Reader, string, error) {

	var body io.Reader
	var cType string

	switch r.BodyType {
	case "json":
		v := htf.toTextBody(r)
		body = v
		cType = "application/json"

	case "xml":
		v := htf.toTextBody(r)

		body = v
		cType = "application/xml"

	case "plaintext":
		v := htf.toTextBody(r)

		body = v
		cType = "text/plain"

	case "urlencoded":
		v, err := htf.toURLEncodedFormData(r)

		if err != nil {
			return nil, "", err
		}

		body = v
		cType = "application/x-www-form-urlencoded"

	case "multipart":
		v, t, err := htf.toMultipartFormData(r)

		if err != nil {
			return nil, "", err
		}

		body = v
		cType = t

	case "binary":
		v, err := htf.toBinaryBody(r)

		if err != nil {
			return nil, "", err
		}

		body = v
		cType = "application/octate-stream"
	}

	return body, cType, nil
}

func applyAuth(r *models.GurlReq, req *http.Request) {
	if r.Auth.AuthEnabled {
		switch r.Auth.AuthType {
		case "basic":
			req.SetBasicAuth(r.Auth.BasicAuth.Username, r.Auth.BasicAuth.Password)
		case "api_key":
			if r.Auth.ApiKeyAuth.Location == "header" && r.Auth.ApiKeyAuth.Key != "" {
				req.Header.Add(r.Auth.ApiKeyAuth.Key, r.Auth.ApiKeyAuth.Value)
			}

			if r.Auth.ApiKeyAuth.Location == "query" && r.Auth.ApiKeyAuth.Key != "" {
				q := req.URL.Query()
				q.Add(r.Auth.ApiKeyAuth.Key, r.Auth.ApiKeyAuth.Value)
				req.URL.RawQuery = q.Encode()
			}
		case "token":
			caser := cases.Title(language.English)
			if r.Auth.TokenAuth.Type != "" {
				req.Header.Add("Authorization", fmt.Sprintf("%s %s", caser.String(r.Auth.TokenAuth.Type), r.Auth.TokenAuth.Token))
			}

		}
	}
}

func (htf *HttpTransformer) TransformToHttp(ctx context.Context, r *models.GurlReq, defaultAgent string) (*http.Request, error) {

	//query
	queryParams := url.Values{}

	for _, q := range r.Query {
		if q.Enabled && q.Key != "" {
			queryParams.Add(q.Key, q.Value)
		}
	}

	//url
	parsedUrl, err := url.Parse(r.Url)

	if err != nil {
		return nil, err
	}

	parsedUrl.RawQuery = queryParams.Encode()

	endpoint := parsedUrl.String()

	log.Println("[Executor] request url: ", endpoint)

	body, cType, err := htf.prepareHttpBody(r)

	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, r.Method, endpoint, body)

	if err != nil {
		return nil, err
	}

	//set User Defined headers
	for _, header := range r.Headers {
		if header.Enabled && header.Key != "" {
			req.Header.Add(header.Key, header.Value)
		}
	}

	//set Content-Type if not set
	if body != nil && req.Header.Get("content-type") == "" {
		req.Header.Set("content-type", cType)
	}

	//set User-Agent if not set
	if req.Header.Get("user-agent") == "" {
		req.Header.Set("user-agent", defaultAgent)
	}

	//cookies
	if v := req.Header.Get("Cookie"); v == "" {
		for _, cookie := range r.Cookies {
			if cookie.Enabled {
				req.AddCookie(&http.Cookie{
					Name:  cookie.Key,
					Value: cookie.Value,
				})
			}
		}
	}

	//auth
	applyAuth(r, req)

	return req, nil
}

func (htf *HttpTransformer) TempStoreResponse(id string, res *http.Response, baseDir string) (*models.TempStorageStats, error) {

	log.Println("[Transformer] determining file extension and content type")

	reportedCtype := res.Header.Get("content-type")

	log.Println("[Transformer] Reported content type by server is ", reportedCtype)

	reportedCtype = utils.NormalizeContentType(reportedCtype)

	defer res.Body.Close()

	tmpF, err := os.CreateTemp(baseDir, fmt.Sprintf("gurl-%s*", id))

	if err != nil {
		return nil, err
	}

	defer tmpF.Close()

	dlStart := time.Now()

	limitReader := &io.LimitedReader{
		R: res.Body,
		N: internal.MAX_RESPONSE_LIMIT_BYTES + 1,
	}

	writtenBytes, err := io.Copy(tmpF, limitReader)

	if err != nil {
		return nil, err
	}

	SizeLimitExceeded := writtenBytes > internal.MAX_RESPONSE_LIMIT_BYTES

	dlMs := time.Since(dlStart).Milliseconds()

	log.Printf("[Transformer] stored response at %s in %dms", tmpF.Name(), dlMs)

	mimetype.SetLimit(512)
	detectedCtype, err := mimetype.DetectFile(tmpF.Name())

	if err != nil {
		return nil, err
	}

	log.Println("[Transformer] detected content-type by mimetype magic number lib is ", detectedCtype.String())

	log.Println("[Transformer] detected extension by mimetype magic number lib is ", detectedCtype.Extension())

	normalizedCtype := utils.NormalizeContentType(detectedCtype.String())

	mimeRecord, err := htf.lookupMimeRecord(normalizedCtype)

	defaultExt := ".bin"
	mimeTypeLibExt := detectedCtype.Extension()
	mimeDbExt := ""

	if err != nil {
		log.Println("[Transformer] Unable to fetch mime record")
	} else {
		exts := strings.Split(mimeRecord.Extensions, ",")
		if len(exts) > 0 && exts[0] != "" {
			mimeDbExt = fmt.Sprintf(".%s", exts[0])
			log.Println("[Transformer] Detected extension by mime db is", mimeDbExt)
		}
	}

	finalExt := ""

	if mimeDbExt != "" {
		finalExt = mimeDbExt
	} else {
		if mimeTypeLibExt != "" {
			finalExt = mimeTypeLibExt
		} else {
			finalExt = defaultExt
		}
	}

	newTempFilePath := tmpF.Name() + finalExt

	err = os.Rename(tmpF.Name(), newTempFilePath)
	if err != nil {
		return nil, err
	}

	log.Println("[Transformer] Renamed temp file ", newTempFilePath)

	return &models.TempStorageStats{
		TempFilePath:      newTempFilePath,
		Size:              writtenBytes,
		TimeToStoredMs:    dlMs,
		TempFileExtension: finalExt,
		TempFileMimeType:  normalizedCtype,
		ReportedMimeType:  reportedCtype,
		SizeLimitExceeded: SizeLimitExceeded,
	}, nil
}

func (htf *HttpTransformer) TransformHttpResponse(
	id string,
	req *http.Request,
	res *http.Response,
	ttfbMs int64,
	tempStorageStats *models.TempStorageStats,
	renderBasePath string,
) *models.GurlRes {

	gres := &models.GurlRes{
		Id: id,
	}

	if req.ContentLength >= 0 {
		gres.UploadBytes = req.ContentLength
	}

	log.Printf("[Transform] UploadSize: %d", gres.UploadBytes)

	//status
	gres.StatusText = res.Status
	gres.StatusCode = res.StatusCode
	gres.Success = res.StatusCode >= 200 && res.StatusCode < 300

	//response headers
	for k, v := range res.Header {
		for _, c := range v {
			gres.ResHeaders = append(gres.ResHeaders, models.GurlKeyValItem{
				Key:   k,
				Value: c,
			})
		}
	}

	//request headers
	for k, v := range req.Header {
		for _, c := range v {
			gres.ReqHeaders = append(gres.ReqHeaders, models.GurlKeyValItem{
				Key:   k,
				Value: c,
			})
		}
	}

	//body
	cType := tempStorageStats.TempFileMimeType

	html5Tag := "unsupported"
	canRender := false

	if slices.Contains(PREVIEWABLE_IMAGE_MIME, cType) {
		html5Tag = "img"
		canRender = true
	}

	if strings.HasPrefix(cType, "audio/") {
		html5Tag = "audio"
		canRender = true
	}

	if strings.HasPrefix(cType, "video/") {
		html5Tag = "video"
		canRender = true
	}

	if cType == "application/pdf" {
		html5Tag = "pdf"
		canRender = true
	}

	if strings.HasPrefix(cType, "text/") || cType == "application/json" || cType == "application/xml" {
		html5Tag = "text"
		canRender = true
	}

	tmpFileName := filepath.Base(tempStorageStats.TempFilePath)

	gres.Body = &models.GurlRenderMeta{
		Html5Element:     html5Tag,
		Src:              fmt.Sprintf("%s%s", renderBasePath, tmpFileName),
		CanRender:        canRender,
		Filepath:         tempStorageStats.TempFilePath,
		DetectedMimeType: cType,
		ReportedMimeType: tempStorageStats.ReportedMimeType,
		Extension:        tempStorageStats.TempFileExtension,
	}

	//stats
	cLength := res.Header.Get("content-length")

	var reportedSize int64
	var sizeNotReported = true

	if n, err := strconv.Atoi(cLength); err == nil {
		sizeNotReported = false
		reportedSize = int64(n)
	}

	gres.SizeBytes = tempStorageStats.Size
	gres.TimeToFirstByteMs = ttfbMs
	gres.DownloadMs = tempStorageStats.TimeToStoredMs
	gres.TimeMs = ttfbMs + tempStorageStats.TimeToStoredMs
	gres.ReportedSizeBytes = reportedSize
	gres.SizeNotReported = sizeNotReported

	//cookies
	for _, cookie := range res.Cookies() {
		gres.Cookies = append(gres.Cookies, models.GurlResCookie{
			Name:     cookie.Name,
			Value:    cookie.Value,
			Path:     cookie.Path,
			Domain:   cookie.Domain,
			Expires:  cookie.RawExpires,
			MaxAge:   cookie.MaxAge,
			Secure:   cookie.Secure,
			HttpOnly: cookie.HttpOnly,
			SameSite: int(cookie.SameSite),
			Raw:      cookie.Raw,
		})
	}

	gres.LimitExceeded = tempStorageStats.SizeLimitExceeded

	return gres
}
