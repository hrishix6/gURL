package db

import (
	"context"
	"gurl/shared/models"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Workspace struct {
	BaseEntity
	Name      string         `gorm:"column:name"`
	OpenTabs  datatypes.JSON `gorm:"column:openTabs;default:'[]'"`
	ActiveTab string         `gorm:"column:activeTab"`
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

	workspaces, err := gorm.G[Workspace](wr.db).Find(ctx)

	if err != nil {
		return []models.WorkspaceLightDTO{}, err
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
	r, err := gorm.G[Workspace](wr.db).Where("id = ?", id).First(ctx)

	if err != nil {
		return nil, err
	}

	return &models.WorkspaceDTO{
		Id:           r.Id,
		Name:         r.Name,
		OpenTabsJSON: string(r.OpenTabs),
		ActiveTab:    r.ActiveTab,
	}, nil
}

func (wr *WorkspaceRepository) CreateWorkspace(ctx context.Context, dto models.CreateWorkspaceDTO) error {
	w := &Workspace{
		BaseEntity: BaseEntity{
			Id: dto.Id,
		},
		Name: dto.Name,
	}

	return gorm.G[Workspace](wr.db).Create(ctx, w)
}

func (wr *WorkspaceRepository) UpdateWorkspace(id string, dto models.UpdateWorkspaceDTO) error {

	updates := make(map[string]any)

	if dto.OpenTabsJSON != nil {
		updates["openTabs"] = datatypes.JSON([]byte(*dto.OpenTabsJSON))
	}

	if dto.ActiveTab != nil {
		updates["activeTab"] = *dto.ActiveTab
	}

	if dto.Name != nil {
		updates["name"] = *dto.Name
	}

	if len(updates) == 0 {
		return nil
	}

	tx := wr.db.Model(&Workspace{}).Where("id = ?", id).Updates(updates)
	return tx.Error
}
