package storage

import (
	"gurl/shared/models"
)

func (s *DesktopStorage) GetAllWorkspaces() ([]models.WorkspaceLightDTO, error) {
	return s.workspaceRepo.GetAllWorkspaces(s.appCtx)
}

func (s *DesktopStorage) GetWorkspaceById(id string) (*models.WorkspaceDTO, error) {
	return s.workspaceRepo.GetWorkspaceById(s.appCtx, id)
}

func (s *DesktopStorage) CreateWorkspace(dto models.CreateWorkspaceDTO) error {
	return s.workspaceRepo.CreateWorkspace(s.appCtx, dto)
}

func (s *DesktopStorage) UpdateWorkspace(id string, dto models.UpdateWorkspaceDTO) error {
	return s.workspaceRepo.UpdateWorkspace(id, dto)
}
