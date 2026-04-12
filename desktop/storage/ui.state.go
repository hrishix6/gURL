package storage

import (
	"gurl/shared/models"
)

func (s *DesktopStorage) GetUIState() (*models.UIStateDTO, error) {
	return s.uiStateRepo.GetUIStateForUser(s.appCtx)
}

func (s *DesktopStorage) UpdateUIState(dto models.UpdateUIStateDTO) error {
	return s.uiStateRepo.UpdateUIStateForUser(s.appCtx, dto)
}
