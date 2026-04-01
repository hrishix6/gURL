package db

import (
	"context"
	"errors"
	"fmt"
	"gurl/shared/models"
	"gurl/shared/utils"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Environment struct {
	BaseEntity
	Name        string         `gorm:"column:name"`
	Data        datatypes.JSON `gorm:"column:data;default:'[]'"`
	WorkspaceId string         `gorm:"column:workspace_id;default:null"`
	UserId      string         `gorm:"column:user_id;default:null"`
}

func (e *Environment) ToEnvironmentDTO() models.EnvironmentDTO {

	return models.EnvironmentDTO{
		Id:   e.Id,
		Name: e.Name,
		Data: string(e.Data),
	}
}

func (e *Environment) FromEnvironmentDraft(ctx context.Context, dto *models.SaveEnvDraftAsEnvDTO, env *EnvironmentDraft) {

	if e == nil {
		e = &Environment{}
	}

	e.Id = dto.EnvId
	e.Name = dto.Name
	e.Data = env.Data
	e.WorkspaceId = dto.WorkspaceId
	e.UserId = utils.UserIdFromContext(ctx)
}

type EnvironmentRepository struct {
	db *gorm.DB
}

func NewEnvironmentRepository(db *gorm.DB) *EnvironmentRepository {
	return &EnvironmentRepository{
		db: db,
	}
}

func (er *EnvironmentRepository) GetEnvironments(ctx context.Context, workspaceId string) ([]models.EnvironmentDTO, error) {

	user := utils.UserIdFromContext(ctx)

	var envs []Environment

	tx := er.db.Where(&Environment{
		WorkspaceId: workspaceId,
		UserId:      user,
	}).Find(&envs)

	if tx.Error != nil {
		return []models.EnvironmentDTO{}, tx.Error
	}

	var results = []models.EnvironmentDTO{}

	for _, env := range envs {
		results = append(results, env.ToEnvironmentDTO())
	}

	return results, nil

}

func (er *EnvironmentRepository) addEnv(ctx context.Context, r *Environment) error {
	return gorm.G[Environment](er.db).Create(ctx, r)
}

func (er *EnvironmentRepository) AddEnvironment(ctx context.Context, dto models.AddEnvironmentDTO) error {

	envdata := []byte("[]")

	if dto.Data != "" {
		envdata = []byte(dto.Data)
	}

	return er.addEnv(
		ctx,
		&Environment{
			BaseEntity: BaseEntity{
				Id: dto.Id,
			},
			Name:        dto.Name,
			WorkspaceId: dto.WorkspaceId,
			Data:        datatypes.JSON(envdata),
			UserId:      utils.UserIdFromContext(ctx),
		})
}

func (er *EnvironmentRepository) FindEnvDraft(ctx context.Context, id string) (models.EnvironmentDraftDTO, error) {
	r, err := gorm.G[EnvironmentDraft](er.db).Where("id = ?", id).First(ctx)

	if err != nil {
		return models.EnvironmentDraftDTO{}, err
	}

	return r.ToEnvironmentDraftDTO(), nil
}

func (er *EnvironmentRepository) AddFreshEnvDraft(ctx context.Context, id string) error {
	return gorm.G[EnvironmentDraft](er.db).Create(ctx, &EnvironmentDraft{
		BaseEntity: BaseEntity{
			Id: id,
		},
		Name: "New Environment",
	})
}

func (er *EnvironmentRepository) CopyEnvironment(ctx context.Context, id string, dto models.CopyEnvironmentDTO) error {

	user := utils.UserIdFromContext(ctx)

	var env = new(Environment)

	tx := er.db.Where(&Environment{
		BaseEntity: BaseEntity{
			Id: id,
		},
		UserId: user,
	}).First(env)

	if tx.Error != nil {
		return tx.Error
	}

	copyEnv := &Environment{
		BaseEntity: BaseEntity{
			Id: dto.Id,
		},
		Data:        env.Data,
		Name:        fmt.Sprintf("%s-copy", env.Name),
		WorkspaceId: env.WorkspaceId,
		UserId:      user,
	}

	return er.addEnv(ctx, copyEnv)
}

func (er *EnvironmentRepository) AddEnvironmentDraft(ctx context.Context, dto models.AddEnvironmentDraftDTO) error {

	newDraft := &EnvironmentDraft{}

	env, err := gorm.G[Environment](er.db).Where("id = ?", dto.EnvId).First(ctx)

	if err != nil {
		return err
	}

	newDraft.FromEnvironment(dto, &env)

	return gorm.G[EnvironmentDraft](er.db).Create(ctx, newDraft)
}

func (er *EnvironmentRepository) RemoveEnvDraft(ctx context.Context, id string) error {
	_, err := gorm.G[EnvironmentDraft](er.db).Where("id = ?", id).Delete(ctx)

	if err != nil {
		return err
	}

	return nil
}

func (er *EnvironmentRepository) RemoveEnv(ctx context.Context, id string) error {

	tx := er.db.Where(&Environment{
		BaseEntity: BaseEntity{
			Id: id,
		},
		UserId: utils.UserIdFromContext(ctx),
	}).Delete(&Environment{})

	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

func (er *EnvironmentRepository) UpdateEnvDraftData(ctx context.Context, id string, dto models.UpdateEnvDraftDataDTO) error {

	_, err := gorm.G[EnvironmentDraft](er.db).Where("id = ?", id).Update(ctx, "data",
		datatypes.JSON([]byte(dto.DataJSON)),
	)

	if err != nil {
		return err
	}

	return nil
}

func (er *EnvironmentRepository) updateEnvDraftParents(id string, delta map[string]any) error {
	tx := er.db.Model(&EnvironmentDraft{}).Where("id = ?", id).Updates(delta)

	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

func (er *EnvironmentRepository) SaveEnvDraftAsEnv(ctx context.Context, id string, dto models.SaveEnvDraftAsEnvDTO) error {

	draft, err := gorm.G[EnvironmentDraft](er.db).Where("id = ?", id).First(ctx)

	if err != nil {
		return err
	}

	//update draft
	err = er.updateEnvDraftParents(id, map[string]any{
		"parentEnvId":   dto.EnvId,
		"parentEnvName": dto.Name,
	})

	if err != nil {
		return err
	}

	user := utils.UserIdFromContext(ctx)

	var existing = new(Environment)

	// existing, err := gorm.G[Environment](er.db).Where("id = ?", dto.EnvId).First(ctx)
	tx := er.db.Where(&Environment{
		BaseEntity: BaseEntity{
			Id: dto.EnvId,
		},
		UserId: user,
	}).First(existing)

	if tx.Error != nil {

		if errors.Is(tx.Error, gorm.ErrRecordNotFound) {
			env := &Environment{}
			env.FromEnvironmentDraft(ctx, &dto, &draft)
			createErr := er.addEnv(ctx, env)

			if createErr != nil {
				return createErr
			}

			return nil
		}

		return tx.Error
	}

	//delete existing env and instead create new record.
	err = er.RemoveEnv(ctx, existing.Id)

	if err != nil {
		return err
	}

	//create new env with same id and new data
	env := &Environment{}

	env.FromEnvironmentDraft(ctx, &dto, &draft)

	createErr := er.addEnv(ctx, env)

	if createErr != nil {
		return createErr
	}

	return nil
}

func (er *EnvironmentRepository) DeleteEnvDraftsUnderEnv(ctx context.Context, envId string) error {
	tx := er.db.Model(&EnvironmentDraft{}).Where("parentEnvId = ?", envId).Updates(map[string]any{
		"parentEnvId":   "",
		"parentEnvName": "",
	})

	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

func (er *EnvironmentRepository) FindSavedEnvById(ctx context.Context, id string) (Environment, error) {

	env := new(Environment)

	tx := er.db.Where(&Environment{
		BaseEntity: BaseEntity{
			Id: id,
		},
		UserId: utils.UserIdFromContext(ctx),
	}).First(env)

	return *env, tx.Error
}

func (er *EnvironmentRepository) FindEnvCountByName(ctx context.Context, name string) (int64, error) {
	return gorm.G[Environment](er.db).Where("name = ?", name).Count(ctx, "id")
}
