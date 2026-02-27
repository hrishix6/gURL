package storage

import (
	"errors"
	"gurl/internal/db"
	"gurl/internal/models"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

func (s *Storage) addSavedReq(r *db.Request) error {
	return gorm.G[db.Request](s.db).Create(s.appCtx, r)
}

func (s *Storage) findSavedReq(id string) (db.Request, error) {
	return gorm.G[db.Request](s.db).Where("id = ?", id).First(s.appCtx)
}

func (s *Storage) DeleteSavedReq(id string) error {
	_, err := gorm.G[db.Request](s.db).Where("id = ?", id).Delete(s.appCtx)
	return err
}

func (s *Storage) findDraft(id string) (db.RequestDraft, error) {
	return gorm.G[db.RequestDraft](s.db).Where("id = ?", id).First(s.appCtx)
}

func (s *Storage) RemoveDraft(id string) error {
	_, err := gorm.G[db.RequestDraft](s.db).Where("id = ?", id).Delete(s.appCtx)

	if err != nil {
		return err
	}

	return nil
}

func (s *Storage) GetSavedRequests() ([]models.RequestLightDTO, error) {

	records, err := gorm.G[db.Request](s.db).Find(s.appCtx)

	if err != nil {
		return []models.RequestLightDTO{}, err
	}

	var results []models.RequestLightDTO

	for _, record := range records {

		results = append(results, models.RequestLightDTO{
			Id:           record.Id,
			Name:         record.Name,
			Method:       record.Method,
			Url:          record.Url,
			CollectionId: record.CollectionId,
		})
	}

	return results, nil
}

func (s *Storage) FindDraftById(id string) (*models.RequestDraftDTO, error) {
	found, err := gorm.G[db.RequestDraft](s.db).Where("id = ?", id).First(s.appCtx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return found.ToRequestDraftDTO(), nil
}

func (s *Storage) FindDraftIdsByCollection(collectionId string) ([]string, error) {
	drafts, err := gorm.G[db.RequestDraft](s.db).Where("parentCollectionId = ?", collectionId).Find(s.appCtx)

	if err != nil {
		return []string{}, err
	}

	var results []string

	for _, draft := range drafts {
		results = append(results, draft.Id)
	}

	return results, nil
}

func (s *Storage) AddFreshDraft(dto models.AddFreshDraftDTO) error {
	return gorm.G[db.RequestDraft](s.db).Create(s.appCtx, &db.RequestDraft{
		BaseEntity: db.BaseEntity{
			Id: dto.Id,
		},
	})
}

func (s *Storage) AddDraft(dto models.RequestDraftDTO) error {
	var dr db.RequestDraft
	dr.FromRequestDraftDTO(&dto)
	return gorm.G[db.RequestDraft](s.db).Create(s.appCtx, &dr)
}

func (s *Storage) AddDraftFromRequest(dto models.AddDraftFromRequestDTO) error {

	existing, err := s.findSavedReq(dto.RequestId)

	if err != nil {
		return err
	}

	draft := &db.RequestDraft{}

	draft.FromRequest(dto.Id, &existing)

	return gorm.G[db.RequestDraft](s.db).Create(s.appCtx, draft)
}

func (s *Storage) updateDraftParents(id string, delta map[string]interface{}) error {
	tx := s.db.Model(&db.RequestDraft{}).Where("id = ?", id).Updates(delta)

	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

func (s *Storage) DeleteDraftsUnderCollection(collectionId string) error {
	tx := s.db.Model(&db.RequestDraft{}).Where("parentCollectionId = ?", collectionId).Updates(map[string]any{
		"parentRequestId":    "",
		"parentRequestName":  "",
		"parentCollectionId": "",
	})

	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

func (s *Storage) DeleteRequestDrafts(requestId string) error {
	tx := s.db.Model(&db.RequestDraft{}).Where("parentRequestId = ?", requestId).Updates(map[string]any{
		"parentRequestId":    "",
		"parentRequestName":  "",
		"parentCollectionId": "",
	})

	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

func (s *Storage) SaveDraftAsRequest(dto models.SaveDraftAsReqDTO) error {

	draft, err := s.findDraft(dto.DraftId)

	if err != nil {
		return err
	}

	//update draft
	err = s.updateDraftParents(dto.DraftId, map[string]any{
		"parentRequestId":    dto.RequestId,
		"parentRequestName":  dto.Name,
		"parentCollectionId": dto.CollectionId,
	})

	if err != nil {
		return err
	}

	existing, err := s.findSavedReq(dto.RequestId)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			req := &db.Request{}
			req.FromRequestDraft(&dto, &draft)

			createErr := s.addSavedReq(req)

			if createErr != nil {
				return createErr
			}

			return nil
		} else {
			return err
		}
	}

	//delete existing req and instead create new record.
	err = s.DeleteSavedReq(existing.Id)

	if err != nil {
		return err
	}

	//create new saved request with same id and new data
	req := &db.Request{}

	req.FromRequestDraft(&dto, &draft)

	createErr := s.addSavedReq(req)

	if createErr != nil {
		return createErr
	}

	return nil
}

func (s *Storage) SaveRequestCopy(dto models.SaveRequestCopyDTO) error {

	existing, err := s.findSavedReq(dto.SourceId)

	if err != nil {
		return err
	}

	existing.Id = dto.Id
	existing.Name = dto.Name

	createErr := s.addSavedReq(&existing)

	if createErr != nil {
		return createErr
	}

	return nil
}

func (s *Storage) UpdateDraftFields(dto models.UpdateDraftFieldsDTO) error {
	updates := make(map[string]any)

	if dto.Url != nil {
		updates["url"] = *dto.Url
	}

	if dto.Method != nil {
		updates["method"] = *dto.Method
	}

	if dto.Query != nil {
		updates["query"] = datatypes.JSON([]byte(*dto.Query))
	}

	if dto.Path != nil {
		updates["path"] = datatypes.JSON([]byte(*dto.Path))
	}

	if dto.Headers != nil {
		updates["headers"] = datatypes.JSON([]byte(*dto.Headers))
	}

	if dto.Cookies != nil {
		updates["cookies"] = datatypes.JSON([]byte(*dto.Cookies))
	}

	if dto.BodyType != nil {
		updates["bodyType"] = *dto.BodyType
	}

	if dto.Multipart != nil {
		updates["multipart"] = datatypes.JSON([]byte(*dto.Multipart))
	}

	if dto.UrlEncoded != nil {
		updates["urlencoded"] = datatypes.JSON([]byte(*dto.UrlEncoded))
	}

	if dto.TextBody != nil {
		updates["textbody"] = *dto.TextBody
	}

	if dto.BinaryBody != nil {
		updates["binarybody"] = datatypes.JSON([]byte(*dto.BinaryBody))
	}

	if dto.AuthType != nil {
		updates["authType"] = *dto.AuthType
	}

	if dto.AuthEnabled != nil {
		updates["authEnabled"] = *dto.AuthEnabled
	}

	if dto.BasicAuth != nil {
		updates["basicAuth"] = datatypes.JSON([]byte(*dto.BasicAuth))
	}

	if dto.ApiKeyAuth != nil {
		updates["apiKeyAuth"] = datatypes.JSON([]byte(*dto.ApiKeyAuth))
	}

	if dto.TokenAuth != nil {
		updates["tokenAuth"] = datatypes.JSON([]byte(*dto.TokenAuth))
	}

	if len(updates) == 0 {
		return nil
	}

	tx := s.db.Model(&db.RequestDraft{}).Where("id = ?", dto.DraftId).Updates(updates)
	return tx.Error
}
