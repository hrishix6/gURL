package storage

import (
	"gurl/shared/models"
)

func (s *DesktopStorage) AddCollection(dto models.CreateCollectionDTO) error {
	return s.collectionRepo.AddCollection(s.appCtx, dto)
}

func (s *DesktopStorage) GetCollectionById(id string) (models.CollectionDTO, error) {
	r, err := s.collectionRepo.GetCollectionById(s.appCtx, id)

	if err != nil {
		return models.CollectionDTO{}, err
	}

	return *r, nil
}

func (s *DesktopStorage) GetAllCollections(query models.CollectionsQueryDTO) ([]models.CollectionDTO, error) {
	return s.collectionRepo.GetAllCollections(s.appCtx, query)
}

func (s *DesktopStorage) RenameCollection(id, name string) error {
	return s.collectionRepo.RenameCollection(s.appCtx, id, name)
}

func (s *DesktopStorage) DeleteCollection(id string) error {
	err := s.collectionRepo.DeleteCollection(s.appCtx, id)

	if err != nil {
		return err
	}

	err = s.reqRepo.DeleteDraftsUnderCollection(s.appCtx, id)

	if err != nil {
		return err
	}

	return s.reqMockRepo.DeleteDraftsUnderCollection(s.appCtx, id)
}

func (s *DesktopStorage) ClearCollection(id string) error {
	err := s.collectionRepo.ClearCollection(s.appCtx, id)

	if err != nil {
		return err
	}

	return s.reqRepo.DeleteDraftsUnderCollection(s.appCtx, id)
}

func (s *DesktopStorage) CreateAndStartMockServer(query models.CreateMockServerDTO) (*models.CollectionDTO, error) {
	return s.collectionRepo.CreateMockServer(s.appCtx, query.CollectionId)
}

func (s *DesktopStorage) UpdateMockServer(id string, flag bool) (*models.CollectionDTO, error) {

	return s.collectionRepo.UpdateMockServer(s.appCtx, id, flag)
}

func (s *DesktopStorage) DeleteMockServer(id string) error {

	return s.collectionRepo.DeleteMockServer(s.appCtx, id)
}
