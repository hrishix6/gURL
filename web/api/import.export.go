package api

import (
	"encoding/json"
	"fmt"
	"gurl/internal/models"
	"log"
	"net/http"
)

func (api *Api) ImportCollection(w http.ResponseWriter, r *http.Request) {

	var dto models.WebImportDTO

	err := json.NewDecoder(r.Body).Decode(&dto)

	if err != nil {
		log.Printf("[api/ImportCollection] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "unable to parse body",
			Details: err.Error(),
		})

		api.Bad(w, wrappedErrResponse)
		return
	}

	err = api.exporter.ImportCollection(r.Context(), dto)

	if err != nil {
		log.Printf("[api/ImportCollection] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "failed to import environment",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, nil))
}

func (api *Api) ImportEnvironment(w http.ResponseWriter, r *http.Request) {

	var dto models.WebImportDTO

	err := json.NewDecoder(r.Body).Decode(&dto)

	if err != nil {
		log.Printf("[api/ImportEnvironment] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "unable to parse body",
			Details: err.Error(),
		})

		api.Bad(w, wrappedErrResponse)
		return
	}

	err = api.exporter.ImportEnvironment(r.Context(), dto)

	if err != nil {
		log.Printf("[api/ImportEnvironment] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "failed to import environment",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, nil))
}

func (api *Api) DownloadCollectionExport(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")

	name, data, err := api.exporter.ExportCollection(r.Context(), id)

	if err != nil {
		log.Printf("[api/DownloadCollectionExport] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "failed to export collection",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	attachment := fmt.Sprintf("attachment; filename=\"%s.collection.json\"", name)
	w.Header().Set("Content-Disposition", attachment)
	w.Header().Set("Content-Type", "application/json")

	w.WriteHeader(200)
	w.Write(data)
}

func (api *Api) DownloadEnvironmentExport(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")

	name, data, err := api.exporter.ExportEnvironment(r.Context(), id)

	if err != nil {
		log.Printf("[api/DownloadEnvironmentExport] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "failed to export environment",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	attachment := fmt.Sprintf("attachment; filename=\"%s.env.json\"", name)
	w.Header().Set("Content-Disposition", attachment)
	w.Header().Set("Content-Type", "application/json")

	w.WriteHeader(200)
	w.Write(data)
}
