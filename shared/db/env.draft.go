package db

import (
	"gurl/shared/models"

	"gorm.io/datatypes"
)

type EnvironmentDraft struct {
	BaseEntity
	Name          string         `gorm:"column:name"`
	Data          datatypes.JSON `gorm:"column:data;default:'[]'"`
	ParentEnvId   string         `gorm:"column:parent_env_id"`
	ParentEnvName string         `gorm:"column:parent_env_name"`
	WorkspaceId   string         `gorm:"column:workspace_id;not null"`
	Workspace     Workspace      `gorm:"foreignKey:WorkspaceId;"`
}

func (ed *EnvironmentDraft) ToEnvironmentDraftDTO() models.EnvironmentDraftDTO {

	return models.EnvironmentDraftDTO{
		Id:            ed.Id,
		Name:          ed.Name,
		Data:          string(ed.Data),
		ParentEnvId:   ed.ParentEnvId,
		ParentEnvName: ed.ParentEnvName,
	}
}

func (ed *EnvironmentDraft) FromEnvironment(dto models.AddEnvironmentDraftDTO, e *Environment) {

	if ed == nil {
		ed = &EnvironmentDraft{}
	}

	ed.Id = dto.DraftId
	ed.Name = e.Name
	ed.ParentEnvName = e.Name
	ed.ParentEnvId = e.Id
	ed.Data = e.Data
	ed.WorkspaceId = dto.WorkspaceId
}
