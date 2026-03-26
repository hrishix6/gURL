package api

import (
	"encoding/json"
	"fmt"
	"gurl/shared/models"
	"gurl/web/internal"
	"io"
	"log"
	"net/http"
)

func (api *Api) SendHttpReq(w http.ResponseWriter, r *http.Request) {

	var dto models.GurlReq

	err := json.NewDecoder(r.Body).Decode(&dto)

	if err != nil {
		log.Printf("[api/SendHttpReq] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "failed to parse request config",
			Details: err.Error(),
		})

		api.Bad(w, wrappedErrResponse)
		return
	}

	gurlRes, err := api.executor.SendHttpReq(r.Context(), dto)

	if err != nil {
		log.Printf("[api/SendHttpReq] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "failed to execute http request",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, gurlRes))
}

func (api *Api) CancelReq(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	api.executor.CancelReq(id)
	api.Ok(w, api.WrapSuccessResponse(r, nil))
}

func (api *Api) ParseCookieRaw(w http.ResponseWriter, r *http.Request) {

	var dto models.ParseCookieTextDTO

	err := json.NewDecoder(r.Body).Decode(&dto)

	if err != nil {
		log.Printf("[api/ParseCookieRaw] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "failed to parse cookie request",
			Details: err.Error(),
		})

		api.Bad(w, wrappedErrResponse)
		return
	}

	cookieItems, err := api.executor.ParseCookieRaw(dto.Text)

	if err != nil {
		log.Printf("[api/ParseCookieRaw] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "failed to parse http cookie text",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, cookieItems))
}

func (api *Api) GetSavedResponsesSrc(w http.ResponseWriter, r *http.Request) {
	var dto models.GetSavedResponseSrcDTO

	err := json.NewDecoder(r.Body).Decode(&dto)

	if err != nil {
		log.Printf("[api/GetSavedResponsesSrc] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "failed to request",
			Details: err.Error(),
		})

		api.Bad(w, wrappedErrResponse)
		return
	}

	src := api.executor.GetSavedResponsesSrc(dto.SavedResPath)
	api.Ok(w, api.WrapSuccessResponse(r, src))
}

func (api *Api) UploadTempFormFile(w http.ResponseWriter, r *http.Request) {

	queryParams := r.URL.Query()

	id := queryParams.Get("file_id")

	buffer, err := io.ReadAll(http.MaxBytesReader(w, r.Body, internal.MAX_WEB_TEMP_FILE_BYES))

	defer r.Body.Close()

	if err != nil {
		log.Printf("[api/UploadTempFormFile] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "exeeded limit for temp file",
			Details: err.Error(),
		})

		api.Bad(w, wrappedErrResponse)
		return
	}

	uploadResult := api.executor.UploadWebTempFile(id, buffer)

	if !uploadResult.Success {
		log.Printf("[api/UploadTempFormFile] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: uploadResult.ErrMsg,
			Details: "",
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, uploadResult.Data))
}

func (api *Api) DownloadTempFile(w http.ResponseWriter, r *http.Request) {

	var dto models.DownloadTmpFileDTO

	err := json.NewDecoder(r.Body).Decode(&dto)

	if err != nil {
		log.Printf("[api/SendHttpReq] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "failed to parse request config",
			Details: err.Error(),
		})

		api.Bad(w, wrappedErrResponse)
		return
	}

	attachment := fmt.Sprintf("attachment; filename=\"%s\"", dto.Name)
	w.Header().Set("Content-Disposition", attachment)
	w.Header().Set("Content-Type", dto.MimeType)

	http.ServeFile(w, r, dto.Path)
}
