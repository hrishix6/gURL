package storage

import (
	"errors"
	"fmt"
	"gurl/internal/db"
	"gurl/internal/models"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

func (s *Storage) GetEnvironments() ([]models.EnvironmentDTO, error) {

	envs, err := gorm.G[db.Environment](s.db).Find(s.appCtx)

	if err != nil {
		return []models.EnvironmentDTO{}, err
	}

	var results = []models.EnvironmentDTO{}

	for _, env := range envs {
		results = append(results, env.ToEnvironmentDTO())
	}

	return results, nil
}

func (s *Storage) AddEnvironment(dto models.AddEnvironmentDTO) error {
	return s.addEnv(&db.Environment{
		BaseEntity: db.BaseEntity{
			Id: dto.Id,
		},
		Name: dto.Name,
	})
}

func (s *Storage) addEnv(r *db.Environment) error {
	return gorm.G[db.Environment](s.db).Create(s.appCtx, r)
}

func (s *Storage) FindEnvDraft(id string) (models.EnvironmentDraftDTO, error) {
	r, err := gorm.G[db.EnvironmentDraft](s.db).Where("id = ?", id).First(s.appCtx)

	if err != nil {
		return models.EnvironmentDraftDTO{}, err
	}

	return r.ToEnvironmentDraftDTO(), nil
}

func (s *Storage) AddFreshEnvDraft(id string) error {
	return gorm.G[db.EnvironmentDraft](s.db).Create(s.appCtx, &db.EnvironmentDraft{
		BaseEntity: db.BaseEntity{
			Id: id,
		},
		Name: "New Environment",
	})
}

func (s *Storage) CopyEnvironment(dto models.CopyEnvironmentDTO) error {

	env, err := gorm.G[db.Environment](s.db).Where("id = ?", dto.EnvId).First(s.appCtx)

	if err != nil {
		return err
	}

	copyEnv := &db.Environment{
		BaseEntity: db.BaseEntity{
			Id: dto.Id,
		},
		Data: env.Data,
		Name: fmt.Sprintf("%s-copy", env.Name),
	}

	return s.addEnv(copyEnv)
}

func (s *Storage) AddEnvironmentDraft(dto models.AddEnvironmentDraftDTO) error {

	newDraft := &db.EnvironmentDraft{}

	env, err := gorm.G[db.Environment](s.db).Where("id = ?", dto.EnvId).First(s.appCtx)

	if err != nil {
		return err
	}

	newDraft.FromEnvironment(dto, &env)

	return gorm.G[db.EnvironmentDraft](s.db).Create(s.appCtx, newDraft)
}

func (s *Storage) RemoveEnvDraft(id string) error {
	_, err := gorm.G[db.EnvironmentDraft](s.db).Where("id = ?", id).Delete(s.appCtx)

	if err != nil {
		return err
	}

	return nil
}

func (s *Storage) RemoveEnv(id string) error {
	_, err := gorm.G[db.Environment](s.db).Where("id = ?", id).Delete(s.appCtx)

	if err != nil {
		return err
	}

	return nil
}

func (s *Storage) UpdateEnvDraftData(dto models.UpdateEnvDraftDataDTO) error {

	_, err := gorm.G[db.EnvironmentDraft](s.db).Where("id = ?", dto.DraftId).Update(s.appCtx, "data",
		datatypes.JSON([]byte(dto.DataJSON)),
	)

	if err != nil {
		return err
	}

	return nil
}

func (s *Storage) updateEnvDraftParents(id string, delta map[string]any) error {
	tx := s.db.Model(&db.EnvironmentDraft{}).Where("id = ?", id).Updates(delta)

	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

func (s *Storage) SaveEnvDraftAsEnv(dto models.SaveEnvDraftAsEnvDTO) error {

	draft, err := gorm.G[db.EnvironmentDraft](s.db).Where("id = ?", dto.DraftId).First(s.appCtx)

	if err != nil {
		return err
	}

	//update draft
	err = s.updateEnvDraftParents(dto.DraftId, map[string]any{
		"parentEnvId":   dto.EnvId,
		"parentEnvName": dto.Name,
	})

	if err != nil {
		return err
	}

	existing, err := gorm.G[db.Environment](s.db).Where("id = ?", dto.EnvId).First(s.appCtx)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			env := &db.Environment{}

			env.FromEnvironmentDraft(&dto, &draft)

			createErr := s.addEnv(env)

			if createErr != nil {
				return createErr
			}

			return nil
		} else {
			return err
		}
	}

	//delete existing env and instead create new record.
	err = s.RemoveEnv(existing.Id)

	if err != nil {
		return err
	}

	//create new env with same id and new data
	env := &db.Environment{}

	env.FromEnvironmentDraft(&dto, &draft)

	createErr := s.addEnv(env)

	if createErr != nil {
		return createErr
	}

	return nil
}

func (s *Storage) DeleteEnvDraftsUnderEnv(envId string) error {
	tx := s.db.Model(&db.EnvironmentDraft{}).Where("parentEnvId = ?", envId).Updates(map[string]any{
		"parentEnvId":   "",
		"parentEnvName": "",
	})

	if tx.Error != nil {
		return tx.Error
	}

	return nil
}
