package storage

import (
	"gurl/internal/db"
	"gurl/internal/models"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

func (s *Storage) initializeUIState() error {
	initialState := &db.UIState{}
	initialState.Id = db.DEFAULT_UI_STATE_ID
	return gorm.G[db.UIState](s.db).Create(s.appCtx, initialState)
}

// func (s *Storage) UpdateOpenTabs(dto models.UpdateOpenTabsDTO) error {
// 	_, err := gorm.G[db.UIState](s.db).Where("id = ?", db.DEFAULT_UI_STATE_ID).Update(s.appCtx, "openTabs", datatypes.JSON([]byte(dto.OpenTabsJSON)))

// 	return err
// }

// func (s *Storage) UpdateLayoutPreference(layout string) error {
// 	_, err := gorm.G[db.UIState](s.db).Where("id = ?", db.DEFAULT_UI_STATE_ID).Update(s.appCtx, "layout", layout)

// 	return err
// }

// func (s *Storage) UpdateSideBarPreference(isOpen bool) error {
// 	_, err := gorm.G[db.UIState](s.db).Where("id = ?", db.DEFAULT_UI_STATE_ID).Update(s.appCtx, "sidebarOpen", isOpen)

// 	return err
// }

func (s *Storage) GetUIState() (*models.UIStateDTO, error) {
	r, err := gorm.G[db.UIState](s.db).Where("id = ?", db.DEFAULT_UI_STATE_ID).First(s.appCtx)

	if err != nil {
		return nil, err
	}

	return &models.UIStateDTO{
		OpenTabs:               string(r.OpenTabs),
		Layout:                 r.Layout,
		ActiveTab:              r.ActiveTab,
		IsSidebarOpen:          r.IsSidebarOpen,
		AlwaysDiscard:          r.AlwaysDiscardDrafts,
		AlwaysDiscardEnvDrafts: r.AlwaysDiscardEnvDrafts,
	}, nil
}

// func (s *Storage) UpdateActiveTab(tabId string) error {
// 	_, err := gorm.G[db.UIState](s.db).Where("id = ?", db.DEFAULT_UI_STATE_ID).Update(s.appCtx, "activeTab", tabId)
// 	return err
// }

// func (s *Storage) UpdateAlwaysDiscardDraftsPreference(alwaysDiscard bool) error {
// 	_, err := gorm.G[db.UIState](s.db).Where("id = ?", db.DEFAULT_UI_STATE_ID).Update(s.appCtx, "alwaysDiscardDrafts", alwaysDiscard)
// 	return err
// }

// func (s *Storage) UpdateAlwaysDiscardEnvDraftsPreference(alwaysDiscard bool) error {
// 	_, err := gorm.G[db.UIState](s.db).Where("id = ?", db.DEFAULT_UI_STATE_ID).Update(s.appCtx, "alwaysDiscardEnvDrafts", alwaysDiscard)
// 	return err
// }

func (s *Storage) UpdateUIState(dto models.UpdateUIStateDTO) error {

	updates := make(map[string]any)

	if dto.Layout != nil {
		updates["layout"] = *dto.Layout
	}

	if dto.OpenTabsJSON != nil {
		updates["openTabs"] = datatypes.JSON([]byte(*dto.OpenTabsJSON))
	}

	if dto.IsSidebarOpen != nil {
		updates["sidebarOpen"] = *dto.IsSidebarOpen
	}

	if dto.ActiveTabId != nil {
		updates["activeTab"] = *dto.ActiveTabId
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
