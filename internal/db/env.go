package db

import (
	"gurl/internal/models"

	"gorm.io/datatypes"
)

type Environment struct {
	BaseEntity
	Name        string         `gorm:"column:name"`
	Data        datatypes.JSON `gorm:"column:data;default:'[]'"`
	WorkspaceId string         `gorm:"column:workspace_id;default:null"`
}

func (e *Environment) ToEnvironmentDTO() models.EnvironmentDTO {

	return models.EnvironmentDTO{
		Id:   e.Id,
		Name: e.Name,
		Data: string(e.Data),
	}
}

func (e *Environment) FromEnvironmentDraft(dto *models.SaveEnvDraftAsEnvDTO, env *EnvironmentDraft) {

	if e == nil {
		e = &Environment{}
	}

	e.Id = dto.EnvId
	e.Name = dto.Name
	e.Data = env.Data
	e.WorkspaceId = dto.WorkspaceId
}
