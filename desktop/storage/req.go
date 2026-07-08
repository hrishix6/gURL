package storage

import (
	"gurl/shared/models"
)

func (s *DesktopStorage) DeleteSavedReq(id string) error {
	err := s.reqRepo.DeleteSavedReq(s.appCtx, id)

	if err != nil {
		return err
	}

	return s.reqRepo.DeleteRequestDrafts(s.appCtx, id)
}

func (s *DesktopStorage) RemoveDraft(id string) error {
	return s.reqRepo.RemoveDraft(s.appCtx, id)
}

func (s *DesktopStorage) GetSavedRequestById(id string) (models.RequestLightDTO, error) {
	r, err := s.reqRepo.GetSavedRequestById(s.appCtx, id)

	if err != nil {
		return models.RequestLightDTO{}, err
	}

	return *r, nil
}

func (s *DesktopStorage) GetSavedRequests(query models.ReqQueryDTO) ([]models.RequestLightDTO, error) {
	return s.reqRepo.GetSavedRequests(s.appCtx, query)
}

func (s *DesktopStorage) FindDraftById(id string) (*models.RequestDraftDTO, error) {
	return s.reqRepo.FindDraftById(s.appCtx, id)
}

func (s *DesktopStorage) AddFreshDraft(dto models.AddDraftDTO) error {
	return s.reqRepo.AddFreshDraft(s.appCtx, dto)
}

func (s *DesktopStorage) AddDraft(dto models.RequestDraftDTO) error {
	return s.reqRepo.AddDraft(s.appCtx, dto)
}

func (s *DesktopStorage) AddDraftFromRequest(id string, dto models.AddDraftDTO) error {
	return s.reqRepo.AddDraftFromRequest(s.appCtx, id, dto)
}

func (s *DesktopStorage) SaveDraftAsRequest(id string, dto models.SaveDraftAsReqDTO) (*models.RequestDraftDTO, error) {
	return s.reqRepo.SaveDraftAsRequest(s.appCtx, id, dto)
}

func (s *DesktopStorage) SaveRequestCopy(id string, dto models.SaveRequestCopyDTO) (string, error) {
	return s.reqRepo.SaveRequestCopy(s.appCtx, id, dto)
}

func (s *DesktopStorage) UpdateDraftFields(id string, dto models.UpdateDraftFieldsDTO) error {
	return s.reqRepo.UpdateDraftFields(s.appCtx, id, dto)
}
