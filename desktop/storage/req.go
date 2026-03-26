package storage

import (
	"gurl/shared/models"
)

func (s *DesktopStorage) DeleteSavedReq(id string) error {
	return s.reqRepo.DeleteSavedReq(s.appCtx, id)
}

func (s *DesktopStorage) RemoveDraft(id string) error {
	return s.reqRepo.RemoveDraft(s.appCtx, id)
}

func (s *DesktopStorage) GetSavedRequests(workspaceId string) ([]models.RequestLightDTO, error) {
	return s.reqRepo.GetSavedRequests(s.appCtx, workspaceId)
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

func (s *DesktopStorage) DeleteDraftsUnderCollection(collectionId string) error {
	return s.reqRepo.DeleteDraftsUnderCollection(s.appCtx, collectionId)
}

func (s *DesktopStorage) DeleteRequestDrafts(requestId string) error {
	return s.reqRepo.DeleteRequestDrafts(s.appCtx, requestId)
}

func (s *DesktopStorage) SaveDraftAsRequest(id string, dto models.SaveDraftAsReqDTO) error {
	return s.reqRepo.SaveDraftAsRequest(s.appCtx, id, dto)
}

func (s *DesktopStorage) SaveRequestCopy(id string, dto models.SaveRequestCopyDTO) error {
	return s.reqRepo.SaveRequestCopy(s.appCtx, id, dto)
}

func (s *DesktopStorage) UpdateDraftFields(id string, dto models.UpdateDraftFieldsDTO) error {
	return s.reqRepo.UpdateDraftFields(s.appCtx, id, dto)
}
