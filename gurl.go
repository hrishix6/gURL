package main

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type Gurl struct {
	c     http.Client
	store *ReqStore
	ctx   context.Context
}

func NewGurl() *Gurl {
	return &Gurl{
		c: http.Client{},
		store: &ReqStore{
			m: make(map[string]context.CancelFunc),
		},
	}
}

type GurlKeyValItem struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

type GurlKeyValMultiPartItem struct {
	Key    string `json:"key"`
	Value  string `json:"value"`
	IsFile bool   `json:"isFile"`
}

type GurlReq struct {
	Id             string                    `json:"id"`
	Method         string                    `json:"method"`
	Url            string                    `json:"url"`
	BodyType       string                    `json:"bodyType"`
	Headers        []GurlKeyValItem          `json:"headers"`
	UrlEncodedForm []GurlKeyValItem          `json:"urlencoded"`
	MultiPartForm  []GurlKeyValMultiPartItem `json:"multipart"`
	TextBody       string                    `json:"plaintext"`
	BinaryFile     string                    `json:"binary"`
}

type GurlRes struct {
	Id         string           `json:"id"`
	StatusCode int              `json:"status"`
	StatusText string           `json:"statusText"`
	Success    bool             `json:"success"`
	Headers    []GurlKeyValItem `json:"headers"`
	Body       string           `json:"body"`
	IsFile     bool             `json:"isFile"`
	SizeBytes  int              `json:"size"`
	TimeMs     int64            `json:"time"`
}

func NewGurlRes(id string) *GurlRes {
	return &GurlRes{
		Id: id,
	}
}

func (gres *GurlRes) WithStatus(t string, code int) *GurlRes {
	gres.StatusText = t
	gres.StatusCode = code
	gres.Success = code >= 200 && code < 300
	return gres
}

func (gres *GurlRes) HavingBody(b string) *GurlRes {
	gres.Body = b
	return gres
}

func (gres *GurlRes) WithHeaders(h http.Header) *GurlRes {

	for k, v := range h {
		gres.Headers = append(gres.Headers, GurlKeyValItem{
			Key:   k,
			Value: strings.Join(v, ""),
		})
	}

	return gres
}

func (gres *GurlRes) WithStats(size int, timeMs int64) *GurlRes {
	gres.SizeBytes = size
	gres.TimeMs = timeMs
	return gres
}

type ReqStore struct {
	sync.Mutex
	m map[string]context.CancelFunc
}

func (rs *ReqStore) AddReq(id string, cancelFn context.CancelFunc) {
	rs.Lock()
	defer rs.Unlock()
	rs.m[id] = cancelFn
}

func (rs *ReqStore) CancelReq(id string) {
	cancelFn, ok := rs.m[id]

	if !ok {
		return
	}

	cancelFn()
	delete(rs.m, id)
}

func (g *Gurl) startup(ctx context.Context) {
	g.ctx = ctx
}

type FileStats struct {
	Name string `json:"name"`
	Size int64  `json:"size"`
	Path string `json:"path"`
}

func (g *Gurl) ChooseFile() (*FileStats, error) {

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

	return &FileStats{
		Name: info.Name(),
		Size: info.Size(),
		Path: file,
	}, nil
}

func (g *Gurl) SendReq(r GurlReq) (*GurlRes, error) {

	ctx, cancelFunc := context.WithCancel(context.Background())

	g.store.AddReq(r.Id, cancelFunc)

	req, err := http.NewRequestWithContext(ctx, r.Method, r.Url, nil)

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

	bytes, err := io.ReadAll(res.Body)

	if err != nil {
		return nil, err
	}

	gurlRes := NewGurlRes(r.Id).WithHeaders(res.Header).HavingBody(string(bytes)).WithStatus(res.Status, res.StatusCode).WithStats(len(bytes), end)

	return gurlRes, nil
}

func (g *Gurl) CancelReq(id string) {
	g.store.CancelReq(id)
}
