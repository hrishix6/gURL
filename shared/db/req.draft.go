package db

import (
	"gurl/shared/models"
	"log"
	"os"

	"gorm.io/gorm"
)

type RequestDraft struct {
	BaseEntity
	RequestCore
	ParentRequestId     string    `gorm:"column:parent_request_id"`
	ParentRequestName   string    `gorm:"column:parent_request_name"`
	ParentCollectionId  string    `gorm:"column:parent_collection_id"`
	LastTmpResponsePath string    `gorm:"column:last_res_path;default:''"`
	WorkspaceId         string    `gorm:"column:workspace_id;not null"`
	Workspace           Workspace `gorm:"foreignKey:WorkspaceId;"`
}

// Hooks
func (rd *RequestDraft) BeforeDelete(tx *gorm.DB) error {
	log.Printf("draft delete hook called, attempting to delete %s\n", rd.LastTmpResponsePath)
	if rd.LastTmpResponsePath != "" {
		if err := os.Remove(rd.LastTmpResponsePath); err != nil {
			return err
		}
	}

	return nil
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
	r.WorkspaceId = dto.WorkspaceId
}

func (r *RequestDraft) ToRequestDraftDTO() *models.RequestDraftDTO {
	o := &models.RequestDraftDTO{}
	o.Id = r.Id
	o.ParentRequestId = r.ParentRequestId
	o.ParentRequestName = r.ParentRequestName
	o.ParentCollectionId = r.ParentCollectionId
	o.WorkspaceId = r.WorkspaceId
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
	r.WorkspaceId = req.WorkspaceId
}
