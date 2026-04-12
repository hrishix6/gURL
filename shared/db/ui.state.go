package db

import (
	"context"
	"gurl/shared/models"
	"gurl/shared/utils"

	"gorm.io/gorm"
)

type UIState struct {
	BaseEntity
	IsSidebarOpen          bool   `gorm:"column:sidebar_open;default:true"`
	AlwaysDiscardDrafts    bool   `gorm:"column:always_discard_drafts;default:false"`
	AlwaysDiscardEnvDrafts bool   `gorm:"column:always_discard_env_drafts;default:false"`
	Layout                 string `gorm:"column:layout;default:r"`
	ActiveWorkspace        string `gorm:"column:active_workspace;default:''"`
	ActiveTheme            string `gorm:"column:active_theme;default:'mountain'"`
	UserId                 string `gorm:"column:user_id;not null"`
	User                   User   `gorm:"foreignKey:UserId;"`
}

type UiStateRepository struct {
	db *gorm.DB
}

func NewUiStateRepository(db *gorm.DB) *UiStateRepository {
	return &UiStateRepository{
		db: db,
	}
}

func (usr *UiStateRepository) InitializeUIStateForUser(ctx context.Context, id string) error {
	initialState := &UIState{
		BaseEntity: BaseEntity{
			Id: id,
		},
		UserId: utils.UserIdFromContext(ctx),
	}

	return gorm.G[UIState](usr.db).Create(ctx, initialState)
}

func (usr *UiStateRepository) GetUIStateForUser(ctx context.Context) (*models.UIStateDTO, error) {

	var uiState UIState

	tx := usr.db.Where(&UIState{
		UserId: utils.UserIdFromContext(ctx),
	}).First(&uiState)

	if tx.Error != nil {
		return nil, tx.Error
	}

	return &models.UIStateDTO{
		Layout:                 uiState.Layout,
		IsSidebarOpen:          uiState.IsSidebarOpen,
		AlwaysDiscard:          uiState.AlwaysDiscardDrafts,
		AlwaysDiscardEnvDrafts: uiState.AlwaysDiscardEnvDrafts,
		ActiveWorkspace:        uiState.ActiveWorkspace,
		ActiveTheme:            uiState.ActiveTheme,
	}, nil
}

func buildUIStateUpdateMap(dto models.UpdateUIStateDTO) map[string]any {
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

	if dto.ActiveTheme != nil {
		updates["activeTheme"] = *dto.ActiveTheme
	}

	if dto.AlwaysDiscardReqDrafts != nil {
		updates["alwaysDiscardDrafts"] = *dto.AlwaysDiscardReqDrafts
	}

	if dto.AlwaysDiscardEnvDrafts != nil {
		updates["alwaysDiscardEnvDrafts"] = *dto.AlwaysDiscardEnvDrafts
	}

	return updates
}

func (usr *UiStateRepository) UpdateUIStateForUser(ctx context.Context, dto models.UpdateUIStateDTO) error {

	updates := buildUIStateUpdateMap(dto)

	if len(updates) == 0 {
		return nil
	}

	tx := usr.db.Model(&UIState{}).Where(&UIState{
		UserId: utils.UserIdFromContext(ctx),
	}).Updates(updates)

	return tx.Error
}
