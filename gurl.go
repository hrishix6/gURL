package main

import (
	"context"
	"errors"
	"fmt"
	"gurl/internal"
	"gurl/internal/db"
	"gurl/internal/models"
	"gurl/internal/request"
	"gurl/internal/response"
	"gurl/internal/utils"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"gorm.io/gorm"
)

type Gurl struct {
	c              http.Client
	version        string
	store          *request.GurlReqContextStore
	ctx            context.Context
	tmpDir         string
	gurlResBuilder *response.GurlResponseBuilder
	storage        *db.Storage
	name           string
}

func NewGurl(dbConn *gorm.DB, version string) *Gurl {
	storage := db.NewStorage(dbConn)
	return &Gurl{
		c: http.Client{
			CheckRedirect: func(req *http.Request, via []*http.Request) error {
				return http.ErrUseLastResponse
			},
			Timeout: 5 * time.Minute,
		},
		version:        version,
		name:           fmt.Sprintf("%s_%s", internal.APP_NAME, version),
		store:          request.NewGurlReqContextStore(),
		gurlResBuilder: response.NewGurlResponseBuilder(storage),
		storage:        storage,
	}
}

func (g *Gurl) startup(ctx context.Context) {
	g.ctx = ctx

	tmpDir, err := utils.InitTempDir(g.name)

	if err != nil {
		panic(err)
	}

	g.tmpDir = tmpDir
	fmt.Printf("tmp location for this app: %s", tmpDir)

	g.storage.Init(ctx, mimedbJson)
}

func (g *Gurl) shutdown(ctx context.Context) bool {
	_ = utils.CleanupTempDir(g.tmpDir)
	return false
}

func (g *Gurl) ChooseFile() (*models.FileStats, error) {

	file, err := runtime.OpenFileDialog(g.ctx, runtime.OpenDialogOptions{
		Title:           "Choose File to Upload",
		ShowHiddenFiles: true,
	})

	if err != nil {
		return nil, err
	}

	info, err := os.Stat(file)

	if err != nil {
		return nil, err
	}

	if info.IsDir() {
		return nil, fmt.Errorf("chosen item is not a file")
	}

	return &models.FileStats{
		Name: info.Name(),
		Size: info.Size(),
		Path: file,
	}, nil
}

func (g *Gurl) SendReq(r models.GurlReq) (*models.GurlRes, error) {

	ctx, cancelFunc := context.WithCancel(context.Background())

	g.store.AddReq(r.Id, cancelFunc)

	fmt.Printf("\nadded req %s to store", r.Id)

	var body io.Reader
	var cType string

	//set body
	switch r.BodyType {
	case "json":
		v, err := r.ToTextBody()

		if err != nil {
			return nil, err
		}

		body = v
		cType = "application/json"

	case "xml":
		v, err := r.ToTextBody()

		if err != nil {
			return nil, err
		}

		body = v
		cType = "application/xml"

	case "plaintext":
		v, err := r.ToTextBody()

		if err != nil {
			return nil, err
		}

		body = v
		cType = "text/plain"

	case "urlencoded":
		v, err := r.ToUrlEncodedForm()

		if err != nil {
			return nil, err
		}

		body = v
		cType = "application/x-www-form-urlencoded"

	case "multipart":
		v, t, err := r.ToMultipartFormData()

		if err != nil {
			return nil, err
		}

		body = v
		cType = t

	case "binary":
		v, err := r.ToRawFileUpload()

		if err != nil {
			return nil, err
		}

		body = v
		cType = "application/octet-stream"
	}

	req, err := http.NewRequestWithContext(ctx, r.Method, r.Url, body)

	//set User Defined headers
	for _, header := range r.Headers {
		req.Header.Add(header.Key, header.Value)
	}

	//if no content-type is set by user add Default
	if body != nil && req.Header.Get("content-type") == "" {
		req.Header.Set("content-type", cType)
	}

	//if no User-Agent set by user add default
	if req.Header.Get("user-agent") == "" {
		req.Header.Set("user-agent", g.name)
	}

	defer g.store.CancelReq(r.Id)

	if err != nil {
		return nil, err
	}

	start := time.Now()

	res, err := g.c.Do(req)

	if err != nil {
		return nil, err
	}

	end := time.Since(start).Milliseconds()

	defer res.Body.Close()

	tmpF, err := os.CreateTemp(g.tmpDir, fmt.Sprintf("gurl-%s", r.Id))

	if err != nil {
		return nil, err
	}

	defer tmpF.Close()

	writtenBytes, err := io.Copy(tmpF, res.Body)

	if err != nil {
		return nil, err
	}

	fmt.Printf("stored response at %s", tmpF.Name())

	gurlRes := g.gurlResBuilder.BuildGurlRes(r.Id, res, tmpF.Name(), writtenBytes, end)

	if gurlRes.Body.IsText {
		text, err := g.ReadFileText(gurlRes.Body.Filepath)

		if err != nil {
			return nil, err
		}

		gurlRes.Body.TextContent = text
	}

	return gurlRes, nil
}

func (g *Gurl) CancelReq(id string) {
	g.store.CancelReq(id)
}

func (g *Gurl) SaveFile(src string, ext string) error {

	dst, err := runtime.SaveFileDialog(g.ctx, runtime.SaveDialogOptions{
		Title:           "Choose location to store response",
		DefaultFilename: filepath.Base(src) + ext,
	})

	if err != nil {
		return err
	}

	srcF, err := os.Open(src)

	if err != nil {
		return err
	}

	dstF, err := os.Create(dst)

	if err != nil {
		return err
	}

	_, err = io.Copy(dstF, srcF)

	if err != nil {
		return err
	}

	return nil
}

func (g *Gurl) ReadFileText(src string) (string, error) {

	f, err := os.Open(src)

	if err != nil {
		return "", err
	}

	bytes, err := io.ReadAll(f)

	if err != nil {
		return "", err
	}

	return string(bytes), nil
}

// db
func (g *Gurl) RemoveDraft(id string) error {
	return g.storage.DeleteDraft(id)
}

func (g *Gurl) GetSavedRequests() ([]models.RequestDTO, error) {

	records, err := g.storage.GetSavedRequests()

	if err != nil {
		return []models.RequestDTO{}, err
	}

	var results []models.RequestDTO

	for _, record := range records {

		results = append(results, *record.ToRequestDTO())
	}

	return results, nil
}

func (g *Gurl) FindDraftById(id string) (*models.RequestDraftDTO, error) {
	found, err := g.storage.FindDraft(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return found.ToRequestDraftDTO(), nil
}

func (g *Gurl) AddFreshDraft(dto models.AddFreshDraftDTO) error {
	return g.storage.AddDraft(&models.RequestDraft{
		Id: dto.Id,
	})
}

func (g *Gurl) AddDraft(dto models.RequestDraftDTO) error {
	var dr models.RequestDraft
	dr.FromRequestDraftDTO(&dto)
	return g.storage.AddDraft(&dr)
}

func (g *Gurl) UpdateDraftUrl(dto models.UpdateDraftUrlDTO) error {
	_, err := g.storage.UpdateDraftUrl(dto.RequestId, dto.Url)

	if err != nil {
		return err
	}

	return nil
}

func (g *Gurl) UpdateDraftQuery(dto models.UpdateDraftQueryDTO) error {
	_, err := g.storage.UpdateDraftQuery(dto.RequestId, dto.QueryJSON)

	if err != nil {
		return err
	}

	return nil
}

func (g *Gurl) UpdateDraftHeaders(dto models.UpdateDraftHeadersDTO) error {

	_, err := g.storage.UpdateDraftHeaders(dto.RequestId, dto.HeadersJSON)

	if err != nil {
		return err
	}

	return nil
}

func (g *Gurl) UpdateDraftMultipartForm(dto models.UpdateDraftMultipartFormDTO) error {
	_, err := g.storage.UpdateDraftMultipartForm(dto.RequestId, dto.MultipartJSON)

	if err != nil {
		return err
	}

	return nil
}

func (g *Gurl) UpdateDraftUrlEncodedForm(dto models.UpdateDraftUrlEncodedFormDTO) error {
	_, err := g.storage.UpdateDraftUrlEncodedForm(dto.RequestId, dto.UrlEncodedFormJSON)

	if err != nil {
		return err
	}

	return nil
}

func (g *Gurl) UpdateDraftTextBody(dto models.UpdateDraftTextBodyDTO) error {
	_, err := g.storage.UpdateDraftTextBody(dto.RequestId, dto.TextBody)

	if err != nil {
		return err
	}

	return nil
}

func (g *Gurl) UpdateDraftBinaryBody(dto models.UpdateDraftBinaryBodyDTO) error {
	_, err := g.storage.UpdateDraftBinaryBody(dto.RequestId, dto.BinaryBodyJSON)

	if err != nil {
		return err
	}

	return nil
}

func (g *Gurl) UpdateDraftMethod(dto models.UpdateDraftMethodDTO) error {
	_, err := g.storage.UpdateDraftMethod(dto.RequestId, dto.Method)

	if err != nil {
		return err
	}

	return nil
}

func (g *Gurl) UpdateDraftBodyType(dto models.UpdateDraftBodyTypeDTO) error {
	_, err := g.storage.UpdateDraftBodyType(dto.RequestId, dto.BodyType)

	if err != nil {
		return err
	}

	return nil
}

func (g *Gurl) AddCollection(dto models.AddCollectionDTO) error {
	return g.storage.AddCollection(&models.Collection{
		Id:   dto.Id,
		Name: dto.Name,
	})
}

func (g *Gurl) GetAllCollections() ([]models.CollectionDTO, error) {
	records, err := g.storage.GetAllCollections()

	if err != nil {
		return []models.CollectionDTO{}, err
	}

	var results []models.CollectionDTO

	for _, record := range records {
		results = append(results, *record.ToCollectionDTO())
	}

	return results, nil
}

// tabs
func (g *Gurl) UpdateOpenTabs(dto models.UpdateOpenTabsDTO) error {
	return g.storage.UpdateOpenTabs(dto.OpenTabsJSON)
}

func (g *Gurl) GetOpenTabs() (string, error) {
	r, err := g.storage.GetUIState()
	if err != nil {
		return "", err
	}
	return string(r.OpenTabs), nil
}

func (g *Gurl) SaveDraftAsRequest(dto models.SaveDraftAsReqDTO) error {
	return g.storage.SaveDraftAsRequest(&dto)
}
