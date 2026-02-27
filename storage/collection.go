package storage

import (
	"gurl/internal/db"
	"gurl/internal/models"
	"log"

	"gorm.io/gorm"
)

func (s *Storage) AddCollection(id, name string) error {
	return gorm.G[db.Collection](s.db).Create(s.appCtx, &db.Collection{
		BaseEntity: db.BaseEntity{
			Id: id,
		},
		Name: name,
	})
}

func (s *Storage) GetAllCollections() ([]models.CollectionDTO, error) {
	records, err := gorm.G[db.Collection](s.db).Find(s.appCtx)

	if err != nil {
		return []models.CollectionDTO{}, err
	}

	var results []models.CollectionDTO

	for _, record := range records {
		results = append(results, *record.ToCollectionDTO())
	}

	return results, nil
}

func (s *Storage) RenameCollection(id, name string) error {
	_, err := gorm.G[db.Collection](s.db).Where("id = ?", id).Update(s.appCtx, "name", name)
	return err
}

func (s *Storage) DeleteCollection(id string) error {
	_, err := gorm.G[db.Collection](s.db).Where("id = ?", id).Delete(s.appCtx)

	if err != nil {
		return err
	}

	return nil
}

func (s *Storage) ClearCollection(id string) error {
	r, err := gorm.G[db.Request](s.db).Where("collection_id = ?", id).Delete(s.appCtx)

	log.Printf("deleted %d requsts under collection\n", r)

	return err
}
