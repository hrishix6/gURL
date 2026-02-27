package db

import "gurl/internal/models"

type Collection struct {
	BaseEntity
	Name string `gorm:"column:name"`
}

func (c *Collection) ToCollectionDTO() *models.CollectionDTO {

	o := &models.CollectionDTO{
		Id:   c.Id,
		Name: c.Name,
	}

	return o
}
