package db

import (
	"gurl/internal/models"
)

type Request struct {
	BaseEntity
	RequestCore
	Name         string     `gorm:"column:name;not null"`
	CollectionId string     `gorm:"not null"`
	Collection   Collection `gorm:"constraint:OnDelete:CASCADE;"`
}

func (r *Request) ToRequestDTO() *models.RequestDTO {
	o := &models.RequestDTO{
		Id:             r.Id,
		Name:           r.Name,
		CollectionId:   r.CollectionId,
		RequestCoreDTO: r.ToRequestCoreDTO(),
	}

	return o
}

func (r *Request) FromRequestDraft(payload *models.SaveDraftAsReqDTO, dto *RequestDraft) {
	if r == nil {
		r = &Request{}
	}

	r.Id = payload.RequestId
	r.CollectionId = payload.CollectionId
	r.Name = payload.Name
	r.RequestCore = dto.RequestCore
}
