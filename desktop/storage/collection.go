package storage

import (
	"gurl/shared/models"
)

func (s *DesktopStorage) AddCollection(dto models.CreateCollectionDTO) error {
	return s.collectionRepo.AddCollection(s.appCtx, dto)
}

func (s *DesktopStorage) GetAllCollections(workspaceId string) ([]models.CollectionDTO, error) {
	return s.collectionRepo.GetAllCollections(s.appCtx, workspaceId)
}

func (s *DesktopStorage) RenameCollection(id, name string) error {
	return s.collectionRepo.RenameCollection(s.appCtx, id, name)
}

func (s *DesktopStorage) DeleteCollection(id string) error {
	return s.collectionRepo.DeleteCollection(s.appCtx, id)
}

func (s *DesktopStorage) ClearCollection(id string) error {
	return s.collectionRepo.ClearCollection(s.appCtx, id)
}
