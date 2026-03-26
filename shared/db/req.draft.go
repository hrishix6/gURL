package db

import "gurl/shared/models"

type RequestDraft struct {
	BaseEntity
	RequestCore
	ParentRequestId    string `gorm:"column:parentRequestId"`
	ParentRequestName  string `gorm:"column:parentRequestName"`
	ParentCollectionId string `gorm:"column:parentCollectionId"`
}

func (r *RequestDraft) FromRequestDraftDTO(dto *models.RequestDraftDTO) {

	if r == nil {
		r = &RequestDraft{}
	}

	r.Id = dto.Id
	r.ParentRequestId = dto.ParentRequestId
	r.ParentRequestName = dto.ParentRequestName
	r.ParentCollectionId = dto.ParentCollectionId
	r.RequestCore = r.FromRequestCoreDTO(dto.RequestCoreDTO)
}

func (r *RequestDraft) ToRequestDraftDTO() *models.RequestDraftDTO {
	o := &models.RequestDraftDTO{}
	o.Id = r.Id
	o.ParentRequestId = r.ParentRequestId
	o.ParentRequestName = r.ParentRequestName
	o.ParentCollectionId = r.ParentCollectionId
	o.RequestCoreDTO = r.ToRequestCoreDTO()

	return o
}

func (r *RequestDraft) FromRequest(id string, req *Request) {

	if r == nil {
		r = &RequestDraft{}
	}

	r.Id = id
	r.ParentRequestId = req.Id
	r.ParentCollectionId = req.CollectionId
	r.ParentRequestName = req.Name
	r.RequestCore = req.RequestCore
}
