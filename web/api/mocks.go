package api

import (
	"encoding/json"
	"errors"
	"fmt"
	"gurl/shared/models"
	webModels "gurl/web/internal/models"
	"log"
	"net/http"

	"gorm.io/gorm"
)

func (api *Api) GetMocks(w http.ResponseWriter, r *http.Request) {

	queryParams := r.URL.Query()

	workspaceId := queryParams.Get("workspaceId")
	collectionId := queryParams.Get("collectionId")

	mocks, err := api.storage.ReqMockRepo.GetMocks(r.Context(), models.MockQueryDTO{
		WorkspaceId:  workspaceId,
		CollectionId: collectionId,
	})

	if err != nil {
		log.Printf("[api/GetMocks] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, webModels.RequestError{
			Message: "failed to load mocks from db",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, mocks))
}

func (api *Api) GetMockById(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")

	draft, err := api.storage.ReqMockRepo.GetMockById(r.Context(), id)

	if err != nil {
		log.Printf("[api/GetMockById] error:%v \n", err)

		wrappedErr := webModels.RequestError{
			Message: fmt.Sprintf("failed to mock with id %s from db", id),
			Details: err.Error(),
		}

		if errors.Is(err, gorm.ErrRecordNotFound) {
			wrappedErr.Message = fmt.Sprintf("mock with id %s not found", id)
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

func (api *Api) DeleteMock(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")
	err := api.storage.ReqMockRepo.DeleteMockById(r.Context(), id)

	if err != nil {
		log.Printf("[api/DeleteMock] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, webModels.RequestError{
			Message: fmt.Sprintf("failed to delete mock with id: %s", id),
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	err = api.storage.ReqMockRepo.DeleteDraftsUnderMock(r.Context(), id)

	if err != nil {
		log.Printf("[api/DeleteReq] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, webModels.RequestError{
			Message: fmt.Sprintf("failed to remove drafts -> req reference with id: %s", id),
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, nil))
}

func (api *Api) GetMockDraftById(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")

	draft, err := api.storage.ReqMockRepo.GetMockDraftById(r.Context(), id)

	if err != nil {
		log.Printf("[api/GetMockDraftById] error:%v \n", err)

		wrappedErr := webModels.RequestError{
			Message: fmt.Sprintf("failed to mock-draft with id %s from db", id),
			Details: err.Error(),
		}

		if errors.Is(err, gorm.ErrRecordNotFound) {
			wrappedErr.Message = fmt.Sprintf("mock-draft with id %s not found", id)
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

func (api *Api) DeleteMockDraft(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")
	err := api.storage.ReqMockRepo.DeleteMockDraftById(r.Context(), id)

	if err != nil {
		log.Printf("[api/DeleteMockDraft] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, webModels.RequestError{
			Message: fmt.Sprintf("failed to delete mock draft with id: %s", id),
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, nil))
}

func (api *Api) CreateMockDraftFromMock(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")

	var dto models.AddDraftDTO

	err := json.NewDecoder(r.Body).Decode(&dto)

	if err != nil {
		log.Printf("[api/CreateMockDraftFromMock] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, webModels.RequestError{
			Message: "unable to parse body",
			Details: err.Error(),
		})

		api.Bad(w, wrappedErrResponse)
		return
	}

	err = api.storage.ReqMockRepo.AddDraftFromMock(r.Context(), id, dto)

	if err != nil {
		log.Printf("[api/CreateMockDraftFromMock] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, webModels.RequestError{
			Message: "failed to create draft from mock in db",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Created(w, api.WrapSuccessResponse(r, nil))
}

func (api *Api) CreateFreshMockDraft(w http.ResponseWriter, r *http.Request) {

	var dto models.AddDraftDTO

	err := json.NewDecoder(r.Body).Decode(&dto)

	if err != nil {
		log.Printf("[api/CreateFreshMockDraft] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, webModels.RequestError{
			Message: "unable to parse body",
			Details: err.Error(),
		})

		api.Bad(w, wrappedErrResponse)
		return
	}

	err = api.storage.ReqMockRepo.CreateFreshMockDraft(r.Context(), dto)

	if err != nil {
		log.Printf("[api/CreateFreshMockDraft] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, webModels.RequestError{
			Message: "failed to create fresh mock draft in db",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Created(w, api.WrapSuccessResponse(r, nil))

}

func (api *Api) UpdateMockDraftFields(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")

	var dto models.UpdateMockDraftFields

	err := json.NewDecoder(r.Body).Decode(&dto)

	if err != nil {
		log.Printf("[api/UpdateMockDraftFields] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, webModels.RequestError{
			Message: "unable to parse body",
			Details: err.Error(),
		})

		api.Bad(w, wrappedErrResponse)
		return
	}

	err = api.storage.ReqMockRepo.UpdateMockDraftFields(r.Context(), id, dto)

	if err != nil {
		log.Printf("[api/UpdateMockDraftFields] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, webModels.RequestError{
			Message: "failed to update mock draft in db",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, nil))
}

func (api *Api) SaveMockDraftAsMock(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")

	var dto models.SaveMockDraftAsMock

	err := json.NewDecoder(r.Body).Decode(&dto)

	if err != nil {
		log.Printf("[api/SaveMockDraftAsMock] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, webModels.RequestError{
			Message: "unable to parse body",
			Details: err.Error(),
		})

		api.Bad(w, wrappedErrResponse)
		return
	}

	o, err := api.storage.ReqMockRepo.SaveMockDraftAsMock(r.Context(), id, dto)

	if err != nil {
		log.Printf("[api/SaveMockDraftAsMock] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, webModels.RequestError{
			Message: "failed to save mock-draft as mock in db",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Created(w, api.WrapSuccessResponse(r, o))

}

func (api *Api) CopyMockWithId(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")

	o, err := api.storage.ReqMockRepo.CopyMockWithId(r.Context(), id)

	if err != nil {
		log.Printf("[api/CopyMockWithId] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, webModels.RequestError{
			Message: "failed to create copy from mock",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, o))
}
