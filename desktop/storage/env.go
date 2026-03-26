package storage

import (
	"gurl/shared/models"
)

func (s *DesktopStorage) GetEnvironments(workspaceId string) ([]models.EnvironmentDTO, error) {
	return s.envRepo.GetEnvironments(s.appCtx, workspaceId)
}

func (s *DesktopStorage) AddEnvironment(dto models.AddEnvironmentDTO) error {
	return s.envRepo.AddEnvironment(s.appCtx, dto)
}

func (s *DesktopStorage) FindEnvDraft(id string) (models.EnvironmentDraftDTO, error) {
	return s.envRepo.FindEnvDraft(s.appCtx, id)
}

func (s *DesktopStorage) AddFreshEnvDraft(id string) error {
	return s.envRepo.AddFreshEnvDraft(s.appCtx, id)
}

func (s *DesktopStorage) CopyEnvironment(id string, dto models.CopyEnvironmentDTO) error {
	return s.envRepo.CopyEnvironment(s.appCtx, id, dto)
}

func (s *DesktopStorage) AddEnvironmentDraft(dto models.AddEnvironmentDraftDTO) error {
	return s.envRepo.AddEnvironmentDraft(s.appCtx, dto)
}

func (s *DesktopStorage) RemoveEnvDraft(id string) error {
	return s.envRepo.RemoveEnvDraft(s.appCtx, id)
}

func (s *DesktopStorage) RemoveEnv(id string) error {
	return s.envRepo.RemoveEnv(s.appCtx, id)
}

func (s *DesktopStorage) UpdateEnvDraftData(id string, dto models.UpdateEnvDraftDataDTO) error {
	return s.envRepo.UpdateEnvDraftData(s.appCtx, id, dto)
}

func (s *DesktopStorage) SaveEnvDraftAsEnv(id string, dto models.SaveEnvDraftAsEnvDTO) error {
	return s.envRepo.SaveEnvDraftAsEnv(s.appCtx, id, dto)
}

func (s *DesktopStorage) DeleteEnvDraftsUnderEnv(envId string) error {
	return s.envRepo.DeleteEnvDraftsUnderEnv(s.appCtx, envId)
}
