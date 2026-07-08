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

func (api *Api) GetAllCollections(w http.ResponseWriter, r *http.Request) {

	queryParams := r.URL.Query()

	queryDTO := models.CollectionsQueryDTO{}

	queryDTO.WorkspaceId = queryParams.Get("workspaceId")

	collections, err := api.storage.CollectionRepo.GetAllCollections(r.Context(), queryDTO)

	if err != nil {
		log.Printf("[api/GetAllCollections] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, webModels.RequestError{
			Message: "failed to load collections from db",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, collections))
}

func (api *Api) GetCollectionById(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")

	c, err := api.storage.CollectionRepo.GetCollectionById(r.Context(), id)

	if err != nil {
		log.Printf("[api/GetCollectionById] error:%v \n", err)

		wrappedErr := webModels.RequestError{
			Message: fmt.Sprintf("failed to find collection with id %s from db", id),
			Details: err.Error(),
		}

		if errors.Is(err, gorm.ErrRecordNotFound) {
			wrappedErr.Message = fmt.Sprintf("collection with id %s not found", id)
			wrappedErrResponse := api.WrapErrorResponse(r, wrappedErr)
			api.NotFound(w, wrappedErrResponse)
			return
		}

		wrappedErrResponse := api.WrapErrorResponse(r, wrappedErr)
		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, c))
}

func (api *Api) CreateCollection(w http.ResponseWriter, r *http.Request) {

	var dto models.CreateCollectionDTO

	err := json.NewDecoder(r.Body).Decode(&dto)

	if err != nil {
		log.Printf("[api/CreateCollection] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, webModels.RequestError{
			Message: "unable to parse body",
			Details: err.Error(),
		})

		api.Bad(w, wrappedErrResponse)
		return
	}

	err = api.storage.CollectionRepo.AddCollection(r.Context(), dto)

	if err != nil {
		log.Printf("[api/CreateCollection] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, webModels.RequestError{
			Message: "failed to create collection in db",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Created(w, api.WrapSuccessResponse(r, nil))
}

func (api *Api) RenameCollection(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")

	var dto models.RenameCollectionDTO

	err := json.NewDecoder(r.Body).Decode(&dto)

	if err != nil {
		log.Printf("[api/RenameCollection] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, webModels.RequestError{
			Message: "unable to parse body",
			Details: err.Error(),
		})

		api.Bad(w, wrappedErrResponse)
		return
	}

	err = api.storage.CollectionRepo.RenameCollection(r.Context(), id, dto.Name)

	if err != nil {
		log.Printf("[api/RenameCollection] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, webModels.RequestError{
			Message: fmt.Sprintf("failed to rename collection with id: %s", id),
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, nil))
}

func (api *Api) DeleteCollection(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	err := api.storage.CollectionRepo.DeleteCollection(r.Context(), id)

	if err != nil {
		log.Printf("[api/DeleteCollection] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, webModels.RequestError{
			Message: fmt.Sprintf("failed to delete collection with id: %s", id),
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	err = api.storage.ReqRepo.DeleteDraftsUnderCollection(r.Context(), id)

	if err != nil {
		log.Printf("[api/DeleteCollection] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, webModels.RequestError{
			Message: fmt.Sprintf("failed to remove drafts -> collection reference id: %s", id),
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	err = api.storage.ReqMockRepo.DeleteDraftsUnderCollection(r.Context(), id)

	if err != nil {
		log.Printf("[api/DeleteCollection] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, webModels.RequestError{
			Message: fmt.Sprintf("failed to remove mocks -> collection reference id: %s", id),
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, nil))
}

func (api *Api) ClearCollection(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")
	err := api.storage.CollectionRepo.ClearCollection(r.Context(), id)

	if err != nil {
		log.Printf("[api/ClearCollection] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, webModels.RequestError{
			Message: fmt.Sprintf("failed to clear collection with id: %s", id),
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	err = api.storage.ReqRepo.DeleteDraftsUnderCollection(r.Context(), id)

	if err != nil {
		log.Printf("[api/ClearCollection] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, webModels.RequestError{
			Message: fmt.Sprintf("failed to remove drafts -> collection reference with id: %s", id),
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, nil))
}

func (api *Api) CreateMockServer(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")

	c, err := api.storage.CollectionRepo.CreateMockServer(r.Context(), id)

	if err != nil {
		log.Printf("[api/CreateMockServer] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, webModels.RequestError{
			Message: fmt.Sprintf("failed to create mock server for collection id: %s", id),
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, c))
}

func (api *Api) EnableMockServer(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")

	c, err := api.storage.CollectionRepo.UpdateMockServer(r.Context(), id, true)

	if err != nil {
		log.Printf("[api/EnableMockServer] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, webModels.RequestError{
			Message: fmt.Sprintf("failed to enable mock server for collection id: %s", id),
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, c))
}

func (api *Api) DisableMockServer(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")

	c, err := api.storage.CollectionRepo.UpdateMockServer(r.Context(), id, false)

	if err != nil {
		log.Printf("[api/EnableMockServer] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, webModels.RequestError{
			Message: fmt.Sprintf("failed to disable mock server for collection id: %s", id),
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, c))
}
