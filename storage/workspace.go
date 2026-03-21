package storage

import (
	"gurl/internal/db"
	"gurl/internal/models"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

func (s *Storage) GetAllWorkspaces() ([]models.WorkspaceLightDTO, error) {

	workspaces, err := gorm.G[db.Workspace](s.db).Find(s.appCtx)

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

func (s *Storage) GetWorkspaceById(id string) (*models.WorkspaceDTO, error) {
	r, err := gorm.G[db.Workspace](s.db).Where("id = ?", id).First(s.appCtx)

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

func (s *Storage) CreateWorkspace(dto models.CreateWorkspaceDTO) error {
	w := &db.Workspace{
		BaseEntity: db.BaseEntity{
			Id: dto.Id,
		},
		Name: dto.Name,
	}

	return gorm.G[db.Workspace](s.db).Create(s.appCtx, w)
}

func (s *Storage) UpdateWorkspace(id string, dto models.UpdateWorkspaceDTO) error {

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

	tx := s.db.Model(&db.Workspace{}).Where("id = ?", id).Updates(updates)
	return tx.Error
}
