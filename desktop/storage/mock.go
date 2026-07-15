package storage

import "gurl/shared/models"

func (s *DesktopStorage) GetMocks(query models.MockQueryDTO) ([]models.MockLightDTO, error) {
	return s.reqMockRepo.GetMocks(s.appCtx, query)
}

func (s *DesktopStorage) DeleteMockById(id string) error {
	err := s.reqMockRepo.DeleteMockById(s.appCtx, id)

	if err != nil {
		return err
	}

	return s.reqMockRepo.DeleteDraftsUnderMock(s.appCtx, id)
}

func (s *DesktopStorage) GetMockDraftById(id string) (*models.MockDraftDTO, error) {
	return s.reqMockRepo.GetMockDraftById(s.appCtx, id)
}

func (s *DesktopStorage) DeleteMockDraftById(id string) error {
	return s.reqMockRepo.DeleteMockDraftById(s.appCtx, id)
}

func (s *DesktopStorage) UpdateMockDraftFields(id string, dto models.UpdateMockDraftFields) error {
	return s.reqMockRepo.UpdateMockDraftFields(s.appCtx, id, dto)
}

func (s *DesktopStorage) CreateMockDraftFromMock(mockId string, dto models.AddDraftDTO) error {
	return s.reqMockRepo.AddDraftFromMock(s.appCtx, mockId, dto)
}

func (s *DesktopStorage) CreateFreshMockDraft(dto models.AddDraftDTO) error {
	return s.reqMockRepo.CreateFreshMockDraft(s.appCtx, dto)
}

func (s *DesktopStorage) SaveMockDraftAsMock(draftId string, dto models.SaveMockDraftAsMock) (*models.MockDraftDTO, error) {
	return s.reqMockRepo.SaveMockDraftAsMock(s.appCtx, draftId, dto)
}

func (s *DesktopStorage) GetMockById(id string) (*models.MockLightDTO, error) {
	return s.reqMockRepo.GetMockById(s.appCtx, id)
}

func (s *DesktopStorage) CopyMockWithId(id string) (*models.MockLightDTO, error) {
	return s.reqMockRepo.CopyMockWithId(s.appCtx, id)
}
