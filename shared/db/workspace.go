package db

import (
	"context"
	"gurl/shared/models"
	"gurl/shared/utils"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Workspace struct {
	BaseEntity
	Name      string         `gorm:"column:name"`
	OpenTabs  datatypes.JSON `gorm:"column:open_tabs;default:'[]'"`
	ActiveTab string         `gorm:"column:active_tab"`
	ActiveEnv string         `gorm:"active_env;default:no_env"`
	UserId    string         `gorm:"column:user_id;not null"`
	User      User           `gorm:"foreignKey:UserId;"`
}

// Hooks
func (w *Workspace) BeforeDelete(tx *gorm.DB) error {

	var collections []Collection

	if err := tx.Where("workspace_id = ? AND user_id = ?", w.Id, w.UserId).Find(&collections).Error; err != nil {
		return err
	}

	for _, c := range collections {

		if err := tx.Delete(&c).Error; err != nil {
			return err
		}
	}

	var reqDrafts []RequestDraft

	if err := tx.Where("workspace_id = ?", w.Id).Find(&reqDrafts).Error; err != nil {
		return err
	}

	for _, rd := range reqDrafts {

		if err := tx.Delete(&rd).Error; err != nil {
			return err
		}
	}

	var envs []Environment

	if err := tx.Where("workspace_id = ? AND user_id = ?", w.Id, w.UserId).Find(&envs).Error; err != nil {
		return err
	}

	for _, e := range envs {

		if err := tx.Delete(&e).Error; err != nil {
			return err
		}
	}

	var envDrafts []EnvironmentDraft

	if err := tx.Where("workspace_id = ?", w.Id).Find(&envDrafts).Error; err != nil {
		return err
	}

	for _, ed := range envDrafts {

		if err := tx.Delete(&ed).Error; err != nil {
			return err
		}
	}

	return nil
}

type WorkspaceRepository struct {
	db *gorm.DB
}

func NewWorkspaceRepository(db *gorm.DB) *WorkspaceRepository {
	return &WorkspaceRepository{
		db: db,
	}
}

func (wr *WorkspaceRepository) GetAllWorkspaces(ctx context.Context) ([]models.WorkspaceLightDTO, error) {

	var workspaces []Workspace

	tx := wr.db.Where(&Workspace{
		UserId: utils.UserIdFromContext(ctx),
	}).Find(&workspaces)

	if tx.Error != nil {
		return []models.WorkspaceLightDTO{}, tx.Error
	}

	var o []models.WorkspaceLightDTO

	for _, w := range workspaces {
		o = append(o, models.WorkspaceLightDTO{
			Id:   w.Id,
			Name: w.Name,
		})
	}

	return o, nil
}

func (wr *WorkspaceRepository) GetWorkspaceById(ctx context.Context, id string) (*models.WorkspaceDTO, error) {

	w := Workspace{}

	tx := wr.db.Where(&Workspace{
		BaseEntity: BaseEntity{
			Id: id,
		},
		UserId: utils.UserIdFromContext(ctx),
	}).First(&w)

	if tx.Error != nil {
		return nil, tx.Error
	}

	return &models.WorkspaceDTO{
		Id:           w.Id,
		Name:         w.Name,
		OpenTabsJSON: string(w.OpenTabs),
		ActiveTab:    w.ActiveTab,
		ActiveEnv:    w.ActiveEnv,
	}, nil
}

func (wr *WorkspaceRepository) CreateWorkspace(ctx context.Context, dto models.CreateWorkspaceDTO) error {
	w := &Workspace{
		BaseEntity: BaseEntity{
			Id: dto.Id,
		},
		Name:   dto.Name,
		UserId: utils.UserIdFromContext(ctx),
	}

	return gorm.G[Workspace](wr.db).Create(ctx, w)
}

func (wr *WorkspaceRepository) UpdateWorkspace(ctx context.Context, id string, dto models.UpdateWorkspaceDTO) error {

	user := utils.UserIdFromContext(ctx)
	updates := make(map[string]any)

	if dto.OpenTabsJSON != nil {
		updates["open_tabs"] = datatypes.JSON([]byte(*dto.OpenTabsJSON))
	}

	if dto.ActiveTab != nil {
		updates["active_tab"] = *dto.ActiveTab
	}

	if dto.ActiveEnv != nil {
		updates["active_env"] = *dto.ActiveEnv
	}

	if dto.Name != nil {
		updates["name"] = *dto.Name
	}

	if len(updates) == 0 {
		return nil
	}

	tx := wr.db.Model(&Workspace{}).Where(&Workspace{
		BaseEntity: BaseEntity{
			Id: id,
		},
		UserId: user,
	}).Updates(updates)

	return tx.Error
}
