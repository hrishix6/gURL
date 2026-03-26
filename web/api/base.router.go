package api

import (
	"fmt"
	"log"
	"net/http"
)

type GurlWebRouter struct {
	*http.ServeMux
	basePath string
}

func NewGurlWebRouter(basepath string) *GurlWebRouter {

	return &GurlWebRouter{
		ServeMux: http.NewServeMux(),
		basePath: basepath,
	}
}

func (r *GurlWebRouter) setPath(method string, path string) string {
	pattern := fmt.Sprintf("%s %s%s", method, r.basePath, path)
	log.Printf("[WebRouter] Registered Route %s\n", pattern)
	return pattern
}

func (r *GurlWebRouter) Get(path string, handler http.HandlerFunc) {
	r.Handle(r.setPath(http.MethodGet, path), handler)
}

func (r *GurlWebRouter) Post(path string, handler http.HandlerFunc) {
	r.Handle(r.setPath(http.MethodPost, path), handler)
}

func (r *GurlWebRouter) Patch(path string, handler http.HandlerFunc) {
	r.Handle(r.setPath(http.MethodPatch, path), handler)
}

func (r *GurlWebRouter) Delete(path string, handler http.HandlerFunc) {
	r.Handle(r.setPath(http.MethodDelete, path), handler)
}

func (r *GurlWebRouter) Put(path string, handler http.HandlerFunc) {
	r.Handle(r.setPath(http.MethodPut, path), handler)
}
