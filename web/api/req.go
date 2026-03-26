package api

import (
	"encoding/json"
	"errors"
	"fmt"
	"gurl/internal/models"
	"log"
	"net/http"

	"gorm.io/gorm"
)

// reqs
func (api *Api) GetRequests(w http.ResponseWriter, r *http.Request) {

	queryParams := r.URL.Query()

	workspaceId := queryParams.Get("workspace_id")

	reqs, err := api.storage.ReqRepo.GetSavedRequests(r.Context(), workspaceId)

	if err != nil {
		log.Printf("[api/GetRequests] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "failed to load requests from db",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, reqs))
}

func (api *Api) CopyRequest(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")
	var dto models.SaveRequestCopyDTO

	err := json.NewDecoder(r.Body).Decode(&dto)

	if err != nil {
		log.Printf("[api/CopyRequest] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "unable to parse body",
			Details: err.Error(),
		})

		api.Bad(w, wrappedErrResponse)
		return
	}

	err = api.storage.ReqRepo.SaveRequestCopy(r.Context(), id, dto)

	if err != nil {
		log.Printf("[api/CopyRequest] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: fmt.Sprintf("failed to copy request in db with id %s", id),
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, nil))
}

func (api *Api) DeleteReq(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")
	err := api.storage.ReqRepo.DeleteSavedReq(r.Context(), id)

	if err != nil {
		log.Printf("[api/DeleteReq] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: fmt.Sprintf("failed to delete req with id: %s", id),
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, nil))
}

func (api *Api) CreateDraftFromRequest(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")

	var dto models.AddDraftDTO

	err := json.NewDecoder(r.Body).Decode(&dto)

	if err != nil {
		log.Printf("[api/CreateDraftFromRequest] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "unable to parse body",
			Details: err.Error(),
		})

		api.Bad(w, wrappedErrResponse)
		return
	}

	err = api.storage.ReqRepo.AddDraftFromRequest(r.Context(), id, dto)

	if err != nil {
		log.Printf("[api/CreateDraftFromRequest] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "failed to create draft from req in db",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Created(w, api.WrapSuccessResponse(r, nil))
}

func (api *Api) SoftDeleteReqDraftsUnderReq(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")
	err := api.storage.ReqRepo.DeleteRequestDrafts(r.Context(), id)

	if err != nil {
		log.Printf("[api/SoftDeleteReqDraftsUnderReq] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "failed to soft delete req-drafts in db",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, nil))
}

// req-drafts
func (api *Api) GetReqDraftById(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")

	draft, err := api.storage.ReqRepo.FindDraftById(r.Context(), id)

	if err != nil {
		log.Printf("[api/GetReqDraftById] error:%v \n", err)

		wrappedErr := &RequestError{
			Message: fmt.Sprintf("failed to req-draft with id %s from db", id),
			Details: err.Error(),
		}

		if errors.Is(err, gorm.ErrRecordNotFound) {
			wrappedErr.Message = fmt.Sprintf("req-draft with id %s not found", id)
			wrappedErrResponse := api.WrapErrorResponse(r, wrappedErr)
			api.NotFound(w, wrappedErrResponse)
			return
		}

		wrappedErrResponse := api.WrapErrorResponse(r, wrappedErr)
		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, draft))
}

func (api *Api) CreateReqDraft(w http.ResponseWriter, r *http.Request) {

	var dto models.RequestDraftDTO

	err := json.NewDecoder(r.Body).Decode(&dto)

	if err != nil {
		log.Printf("[api/CreateReqDraft] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "unable to parse body",
			Details: err.Error(),
		})

		api.Bad(w, wrappedErrResponse)
		return
	}

	err = api.storage.ReqRepo.AddDraft(r.Context(), dto)

	if err != nil {
		log.Printf("[api/CreateReqDraft] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "failed to create req-draft in db",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Created(w, api.WrapSuccessResponse(r, nil))
}

func (api *Api) DeleteReqDraft(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")

	err := api.storage.ReqRepo.RemoveDraft(r.Context(), id)

	if err != nil {
		log.Printf("[api/DeleteReqDraft] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: fmt.Sprintf("failed to delete req-draft with id: %s", id),
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, nil))
}

func (api *Api) CreateFreshReqDraft(w http.ResponseWriter, r *http.Request) {

	var dto models.AddDraftDTO

	err := json.NewDecoder(r.Body).Decode(&dto)

	if err != nil {
		log.Printf("[api/CreateFreshDraft] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "unable to parse body",
			Details: err.Error(),
		})

		api.Bad(w, wrappedErrResponse)
		return
	}

	err = api.storage.ReqRepo.AddFreshDraft(r.Context(), dto)

	if err != nil {
		log.Printf("[api/CreateFreshDraft] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "failed to create fresh req-draft in db",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Created(w, api.WrapSuccessResponse(r, nil))

}

func (api *Api) UpdateReqDraftFields(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")

	var dto models.UpdateDraftFieldsDTO

	err := json.NewDecoder(r.Body).Decode(&dto)

	if err != nil {
		log.Printf("[api/UpdateReqDraftFields] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "unable to parse body",
			Details: err.Error(),
		})

		api.Bad(w, wrappedErrResponse)
		return
	}

	err = api.storage.ReqRepo.UpdateDraftFields(r.Context(), id, dto)

	if err != nil {
		log.Printf("[api/UpdateReqDraftFields] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "failed to update req-draft in db",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, nil))
}

func (api *Api) SaveDraftAsRequest(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")

	var dto models.SaveDraftAsReqDTO

	err := json.NewDecoder(r.Body).Decode(&dto)

	if err != nil {
		log.Printf("[api/SaveDraftAsRequest] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "unable to parse body",
			Details: err.Error(),
		})

		api.Bad(w, wrappedErrResponse)
		return
	}

	err = api.storage.ReqRepo.SaveDraftAsRequest(r.Context(), id, dto)

	if err != nil {
		log.Printf("[api/SaveDraftAsRequest] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "failed to save req-draft as req in db",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Created(w, api.WrapSuccessResponse(r, nil))

}
