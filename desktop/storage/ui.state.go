package storage

import (
	"gurl/internal/models"
)

func (s *DesktopStorage) initializeUIState() error {
	return s.uiStateRepo.InitializeUIState(s.appCtx)
}

func (s *DesktopStorage) GetUIState() (*models.UIStateDTO, error) {
	return s.uiStateRepo.GetUIState(s.appCtx)
}

func (s *DesktopStorage) UpdateUIState(dto models.UpdateUIStateDTO) error {
	return s.uiStateRepo.UpdateUIState(dto)
}
