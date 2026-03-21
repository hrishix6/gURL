package storage

import (
	"gurl/internal/db"
	"gurl/internal/models"

	"gorm.io/gorm"
)

func (s *Storage) initializeUIState() error {
	initialState := &db.UIState{}
	initialState.Id = db.DEFAULT_UI_STATE_ID
	return gorm.G[db.UIState](s.db).Create(s.appCtx, initialState)
}

func (s *Storage) GetUIState() (*models.UIStateDTO, error) {
	r, err := gorm.G[db.UIState](s.db).Where("id = ?", db.DEFAULT_UI_STATE_ID).First(s.appCtx)

	if err != nil {
		return nil, err
	}

	return &models.UIStateDTO{
		Layout:                 r.Layout,
		IsSidebarOpen:          r.IsSidebarOpen,
		AlwaysDiscard:          r.AlwaysDiscardDrafts,
		AlwaysDiscardEnvDrafts: r.AlwaysDiscardEnvDrafts,
		ActiveWorkspace:        r.ActiveWorkspace,
	}, nil
}

func (s *Storage) UpdateUIState(dto models.UpdateUIStateDTO) error {

	updates := make(map[string]any)

	if dto.Layout != nil {
		updates["layout"] = *dto.Layout
	}

	if dto.IsSidebarOpen != nil {
		updates["sidebarOpen"] = *dto.IsSidebarOpen
	}

	if dto.ActiveWorkspace != nil {
		updates["activeWorkspace"] = *dto.ActiveWorkspace
	}

	if dto.AlwaysDiscardReqDrafts != nil {
		updates["alwaysDiscardDrafts"] = *dto.AlwaysDiscardReqDrafts
	}

	if dto.AlwaysDiscardEnvDrafts != nil {
		updates["alwaysDiscardEnvDrafts"] = *dto.AlwaysDiscardEnvDrafts
	}

	if len(updates) == 0 {
		return nil
	}

	tx := s.db.Model(&db.UIState{}).Where("id = ?", db.DEFAULT_UI_STATE_ID).Updates(updates)
	return tx.Error
}
