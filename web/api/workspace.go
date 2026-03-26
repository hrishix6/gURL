package api

import (
	"encoding/json"
	"fmt"
	"gurl/internal/models"
	"log"
	"net/http"
)

func (api *Api) GetAllWorkspaces(w http.ResponseWriter, r *http.Request) {

	workspaces, err := api.storage.WorkspaceRepo.GetAllWorkspaces(r.Context())

	if err != nil {
		log.Printf("[api/GetAllWorkspaces] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "failed to load workspaces from db",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, workspaces))
}

func (api *Api) GetWorkspaceById(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")

	workspace, err := api.storage.WorkspaceRepo.GetWorkspaceById(r.Context(), id)

	if err != nil {
		log.Printf("[api/GetWorkspaceById] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: fmt.Sprintf("failed to load workspace from db for id %s", id),
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, workspace))
}

func (api *Api) CreateWorkspace(w http.ResponseWriter, r *http.Request) {

	var dto models.CreateWorkspaceDTO

	err := json.NewDecoder(r.Body).Decode(&dto)

	if err != nil {
		log.Printf("[api/CreateWorkspace] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "unable to parse body",
			Details: err.Error(),
		})

		api.Bad(w, wrappedErrResponse)
		return
	}

	err = api.storage.WorkspaceRepo.CreateWorkspace(r.Context(), dto)

	if err != nil {
		log.Printf("[api/CreateWorkspace] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "failed to create workspaces in db",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Created(w, api.WrapSuccessResponse(r, nil))
}

func (api *Api) UpdateWorkspace(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")

	var dto models.UpdateWorkspaceDTO

	err := json.NewDecoder(r.Body).Decode(&dto)

	if err != nil {
		log.Printf("[api/UpdateWorkspace] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "unable to parse body",
			Details: err.Error(),
		})

		api.Bad(w, wrappedErrResponse)
		return
	}

	err = api.storage.WorkspaceRepo.UpdateWorkspace(id, dto)

	if err != nil {
		log.Printf("[api/UpdateWorkspace] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "failed to update workspaces in db",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, nil))
}
