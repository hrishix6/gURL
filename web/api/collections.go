package api

import (
	"encoding/json"
	"fmt"
	"gurl/shared/models"
	"log"
	"net/http"
)

func (api *Api) GetAllCollections(w http.ResponseWriter, r *http.Request) {

	queryParams := r.URL.Query()

	workspaceId := queryParams.Get("workspace_id")

	collections, err := api.storage.CollectionRepo.GetAllCollections(r.Context(), workspaceId)

	if err != nil {
		log.Printf("[api/GetAllCollections] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "failed to load collections from db",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, collections))
}

func (api *Api) CreateCollection(w http.ResponseWriter, r *http.Request) {

	var dto models.CreateCollectionDTO

	err := json.NewDecoder(r.Body).Decode(&dto)

	if err != nil {
		log.Printf("[api/CreateCollection] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "unable to parse body",
			Details: err.Error(),
		})

		api.Bad(w, wrappedErrResponse)
		return
	}

	err = api.storage.CollectionRepo.AddCollection(r.Context(), dto)

	if err != nil {
		log.Printf("[api/CreateCollection] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
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
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "unable to parse body",
			Details: err.Error(),
		})

		api.Bad(w, wrappedErrResponse)
		return
	}

	err = api.storage.CollectionRepo.RenameCollection(r.Context(), id, dto.Name)

	if err != nil {
		log.Printf("[api/RenameCollection] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
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
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: fmt.Sprintf("failed to delete collection with id: %s", id),
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
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: fmt.Sprintf("failed to clear collection with id: %s", id),
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, nil))
}

func (api *Api) SoftDeleteReqDraftsUnderCollection(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")

	err := api.storage.ReqRepo.DeleteDraftsUnderCollection(r.Context(), id)

	if err != nil {
		log.Printf("[api/SoftDeleteReqDraftsUnderCollection] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "failed to delete req-draft under collection in db",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, nil))
}
