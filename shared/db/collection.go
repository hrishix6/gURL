package db

import (
	"context"
	"gurl/shared/models"
	"gurl/shared/utils"

	"gorm.io/gorm"
)

type Collection struct {
	BaseEntity
	Name        string    `gorm:"column:name"`
	WorkspaceId string    `gorm:"column:workspace_id;not null"`
	Workspace   Workspace `gorm:"foreignKey:WorkspaceId;"`
	UserId      string    `gorm:"column:user_id;not null"`
	User        User      `gorm:"foreignKey:UserId;"`
}

// Hooks
func (c *Collection) BeforeDelete(tx *gorm.DB) error {

	var reqs []Request

	if err := tx.Where("collection_id = ? AND user_id = ?", c.Id, c.UserId).Find(&reqs).Error; err != nil {
		return err
	}

	for _, r := range reqs {

		if err := tx.Delete(&r).Error; err != nil {
			return err
		}
	}

	return nil
}

func (c *Collection) ToCollectionDTO() *models.CollectionDTO {

	o := &models.CollectionDTO{
		Id:   c.Id,
		Name: c.Name,
	}

	return o
}

type CollectionRepository struct {
	db *gorm.DB
}

func NewCollectionRepository(db *gorm.DB) *CollectionRepository {
	return &CollectionRepository{
		db: db,
	}
}

func (cr *CollectionRepository) AddCollection(ctx context.Context, dto models.CreateCollectionDTO) error {
	return gorm.G[Collection](cr.db).Create(ctx, &Collection{
		BaseEntity: BaseEntity{
			Id: dto.Id,
		},
		Name:        dto.Name,
		WorkspaceId: dto.Workspace,
		UserId:      utils.UserIdFromContext(ctx),
	})
}

func (cr *CollectionRepository) GetAllCollections(ctx context.Context, workspaceId string) ([]models.CollectionDTO, error) {

	user := utils.UserIdFromContext(ctx)

	var records []Collection

	tx := cr.db.Where(&Collection{
		WorkspaceId: workspaceId,
		UserId:      user,
	}).Find(&records)

	if tx.Error != nil {
		return []models.CollectionDTO{}, tx.Error
	}

	var results []models.CollectionDTO

	for _, record := range records {
		results = append(results, *record.ToCollectionDTO())
	}

	return results, nil
}

func (cr *CollectionRepository) RenameCollection(ctx context.Context, id, name string) error {
	_, err := gorm.G[Collection](cr.db).Where("id = ?", id).Update(ctx, "name", name)
	return err
}

func (cr *CollectionRepository) DeleteCollection(ctx context.Context, id string) error {

	c, err := cr.FindCollectionById(ctx, id)

	if err != nil {
		return err
	}

	return cr.db.Delete(&c).Error
}

func (cr *CollectionRepository) ClearCollection(ctx context.Context, id string) error {

	c, err := cr.FindCollectionById(ctx, id)

	if err != nil {
		return err
	}

	var reqs []Request

	if err := cr.db.Where("collection_id = ? AND user_id = ?", c.Id, c.UserId).Find(&reqs).Error; err != nil {
		return err
	}

	for _, r := range reqs {

		if err := cr.db.Delete(&r).Error; err != nil {
			return err
		}
	}

	return err
}

func (cr *CollectionRepository) FindCollectionById(ctx context.Context, id string) (Collection, error) {

	user := utils.UserIdFromContext(ctx)

	var c Collection

	tx := cr.db.Where(&Collection{
		BaseEntity: BaseEntity{
			Id: id,
		},
		UserId: user,
	}).First(&c)

	return c, tx.Error
}

func (cr *CollectionRepository) FindCollectionCountByName(ctx context.Context, name string) (int64, error) {
	return gorm.G[Collection](cr.db).Where("name = ? AND user_id = ?", name, utils.UserIdFromContext(ctx)).Count(ctx, "id")
}
