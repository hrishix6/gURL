package db

import (
	"context"
	"gurl/shared/models"
	"gurl/shared/utils"
	"log"

	"gorm.io/gorm"
)

type Collection struct {
	BaseEntity
	Name        string `gorm:"column:name"`
	WorkspaceId string `gorm:"column:workspace_id;default:null"`
	UserId      string `gorm:"column:user_id;default:null"`
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

	user := utils.UserIdFromContext(ctx)

	tx := cr.db.Where(&Collection{
		BaseEntity: BaseEntity{
			Id: id,
		},
		UserId: user,
	}).Delete(&Collection{})

	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

func (cr *CollectionRepository) ClearCollection(ctx context.Context, id string) error {
	r, err := gorm.G[Request](cr.db).Where("collection_id = ?", id).Delete(ctx)

	log.Printf("deleted %d requsts under collection\n", r)

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
	return gorm.G[Collection](cr.db).Where("name = ?", name).Count(ctx, "id")
}
