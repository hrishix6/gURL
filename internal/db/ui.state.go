package db

import (
	"context"
	"gurl/internal/models"

	"gorm.io/gorm"
)

type UIState struct {
	BaseEntity
	IsSidebarOpen          bool   `gorm:"column:sidebarOpen;default:false"`
	AlwaysDiscardDrafts    bool   `gorm:"column:alwaysDiscardDrafts;default:false"`
	AlwaysDiscardEnvDrafts bool   `gorm:"column:alwaysDiscardEnvDrafts;default:false"`
	Layout                 string `gorm:"column:layout;default:r"`
	ActiveWorkspace        string `gorm:"column:activeWorkspace;default:''"`
}

type UiStateRepository struct {
	db *gorm.DB
}

func NewUiStateRepository(db *gorm.DB) *UiStateRepository {
	return &UiStateRepository{
		db: db,
	}
}

func (usr *UiStateRepository) InitializeUIState(ctx context.Context) error {
	initialState := &UIState{}
	initialState.Id = DEFAULT_UI_STATE_ID
	return gorm.G[UIState](usr.db).Create(ctx, initialState)
}

func (usr *UiStateRepository) GetUIState(ctx context.Context) (*models.UIStateDTO, error) {
	r, err := gorm.G[UIState](usr.db).Where("id = ?", DEFAULT_UI_STATE_ID).First(ctx)

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

func (usr *UiStateRepository) UpdateUIState(dto models.UpdateUIStateDTO) error {

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

	tx := usr.db.Model(&UIState{}).Where("id = ?", DEFAULT_UI_STATE_ID).Updates(updates)
	return tx.Error
}
