package db

import (
	"context"
	"errors"
	"gurl/shared/models"
	"gurl/shared/nanoid"
	"gurl/shared/utils"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Request struct {
	BaseEntity
	RequestCore
	Name         string     `gorm:"column:name;not null"`
	CollectionId string     `gorm:"column:collection_id;not null"`
	Collection   Collection `gorm:"foreignKey:CollectionId;"`
	WorkspaceId  string     `gorm:"column:workspace_id;not null"`
	Workspace    Workspace  `gorm:"foreignKey:WorkspaceId;"`
	UserId       string     `gorm:"column:user_id;not null"`
	User         User       `gorm:"foreignKey:UserId;"`
}

func (r *Request) BeforeDelete(tx *gorm.DB) error {

	var examples []RequestExample

	if err := tx.Where("request_id = ? AND user_id = ?", r.Id, r.UserId).Find(&examples).Error; err != nil {
		return err
	}

	for _, ex := range examples {
		if err := tx.Delete(&ex).Error; err != nil {
			return err
		}
	}

	return nil
}

func (r *Request) ToRequestDTO() *models.RequestDTO {
	o := &models.RequestDTO{
		Id:             r.Id,
		Name:           r.Name,
		CollectionId:   r.CollectionId,
		RequestCoreDTO: r.ToRequestCoreDTO(),
	}

	return o
}

func (r *Request) FromRequestDraft(ctx context.Context, payload *models.SaveDraftAsReqDTO, dto *RequestDraft) {
	if r == nil {
		r = &Request{}
	}

	r.Id = payload.RequestId
	r.CollectionId = payload.CollectionId
	r.WorkspaceId = payload.WorkspaceId
	r.Name = payload.Name
	r.RequestCore = dto.RequestCore
	r.UserId = utils.UserIdFromContext(ctx)
}

func (r *Request) UpdateFromDraft(ctx context.Context, payload *models.SaveDraftAsReqDTO, dto *RequestDraft) {
	r.Name = payload.Name
	r.RequestCore = dto.RequestCore
}

type RequestRepository struct {
	db *gorm.DB
}

func NewRequestRepository(db *gorm.DB) *RequestRepository {
	return &RequestRepository{
		db: db,
	}
}

func (rr *RequestRepository) addSavedReq(ctx context.Context, r *Request) error {
	return gorm.G[Request](rr.db).Create(ctx, r)
}

func (rr *RequestRepository) findSavedReq(ctx context.Context, id string) (Request, error) {

	var req Request

	tx := rr.db.Where(&Request{
		BaseEntity: BaseEntity{
			Id: id,
		},
		UserId: utils.UserIdFromContext(ctx),
	}).First(&req)

	return req, tx.Error
}

func (rr *RequestRepository) DeleteSavedReq(ctx context.Context, id string) error {

	r, err := rr.findSavedReq(ctx, id)

	if err != nil {
		return err
	}

	return rr.db.Delete(&r).Error
}

func (rr *RequestRepository) findDraft(ctx context.Context, id string) (RequestDraft, error) {
	return gorm.G[RequestDraft](rr.db).Where("id = ?", id).First(ctx)
}

func (rr *RequestRepository) RemoveDraft(ctx context.Context, id string) error {
	d, err := rr.findDraft(ctx, id)

	if err != nil {
		return err
	}

	return rr.db.Delete(&d).Error
}

func (rr *RequestRepository) GetSavedRequestById(ctx context.Context, id string) (*models.RequestLightDTO, error) {
	var r Request

	err := rr.db.Where("id = ?", id).First(&r).Error

	if err != nil {
		return nil, err
	}

	return &models.RequestLightDTO{
		Id:           r.Id,
		Name:         r.Name,
		Method:       r.Method,
		Url:          r.Url,
		CollectionId: r.CollectionId,
	}, nil
}

func (rr *RequestRepository) GetSavedRequests(ctx context.Context, reqQuery models.ReqQueryDTO) ([]models.RequestLightDTO, error) {

	var records []Request

	tx := rr.db.Where(&Request{
		WorkspaceId:  reqQuery.WorkspaceId,
		CollectionId: reqQuery.CollectionId,
		UserId:       utils.UserIdFromContext(ctx),
	}).Find(&records)

	if tx.Error != nil {
		return []models.RequestLightDTO{}, tx.Error
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

func (rr *RequestRepository) FindDraftById(ctx context.Context, id string) (*models.RequestDraftDTO, error) {
	found, err := gorm.G[RequestDraft](rr.db).Where("id = ?", id).First(ctx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}

	dto := found.ToRequestDraftDTO()

	if found.ParentCollectionId != "" {
		c, err := gorm.G[Collection](rr.db).Where("id = ?", found.ParentCollectionId).First(ctx)

		if err == nil {
			dto.CollectionInfo = &models.DraftCollectionInfo{
				Name: c.Name,
			}
		}
	}

	if found.ParentRequestId != "" {
		r, err := gorm.G[Request](rr.db).Where("id = ?", found.ParentRequestId).First(ctx)

		if err == nil {
			dto.RequestInfo = &models.DraftRequestInfo{
				Name: r.Name,
			}
		}
	}

	return dto, nil
}

func (rr *RequestRepository) AddFreshDraft(ctx context.Context, dto models.AddDraftDTO) error {
	return gorm.G[RequestDraft](rr.db).Create(ctx, &RequestDraft{
		BaseEntity: BaseEntity{
			Id: dto.Id,
		},
		WorkspaceId: dto.WorkspaceId,
	})
}

func (rr *RequestRepository) AddDraft(ctx context.Context, dto models.RequestDraftDTO) error {
	var dr RequestDraft
	dr.FromRequestDraftDTO(&dto)
	return gorm.G[RequestDraft](rr.db).Create(ctx, &dr)
}

func (rr *RequestRepository) AddDraftFromRequest(ctx context.Context, id string, dto models.AddDraftDTO) error {

	existing, err := rr.findSavedReq(ctx, id)

	if err != nil {
		return err
	}

	draft := &RequestDraft{}

	draft.FromRequest(dto.Id, &existing)

	return gorm.G[RequestDraft](rr.db).Create(ctx, draft)
}

func (rr *RequestRepository) updateDraftParents(id string, delta map[string]interface{}) error {
	tx := rr.db.Model(&RequestDraft{}).Where("id = ?", id).Updates(delta)

	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

func (rr *RequestRepository) DeleteDraftsUnderCollection(ctx context.Context, collectionId string) error {
	tx := rr.db.Model(&RequestDraft{}).Where("parent_collection_id = ?", collectionId).Updates(map[string]any{
		"parent_request_id":    "",
		"parent_request_name":  "",
		"parent_collection_id": "",
	})

	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

func (rr *RequestRepository) DeleteRequestDrafts(ctx context.Context, requestId string) error {
	tx := rr.db.Model(&RequestDraft{}).Where("parent_request_id = ?", requestId).Updates(map[string]any{
		"parent_request_id":    "",
		"parent_request_name":  "",
		"parent_collection_id": "",
	})

	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

func (rr *RequestRepository) SaveDraftAsRequest(ctx context.Context, id string, dto models.SaveDraftAsReqDTO) (*models.RequestDraftDTO, error) {

	draft, err := rr.findDraft(ctx, id)

	if err != nil {
		return nil, err
	}

	o := draft.ToRequestDraftDTO()

	var collection Collection

	err = rr.db.Where("id = ?", dto.CollectionId).First(&collection).Error

	if err != nil {
		return nil, err
	}

	o.CollectionInfo = &models.DraftCollectionInfo{
		Name: collection.Name,
	}

	existing, err := rr.findSavedReq(ctx, dto.RequestId)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			req := &Request{}
			req.FromRequestDraft(ctx, &dto, &draft)

			createErr := rr.addSavedReq(ctx, req)

			if createErr != nil {
				return nil, createErr
			}

			o.RequestInfo = &models.DraftRequestInfo{
				Name: req.Name,
			}

			//update draft
			err = rr.updateDraftParents(id, map[string]any{
				"parent_request_id":    dto.RequestId,
				"parent_request_name":  dto.Name,
				"parent_collection_id": dto.CollectionId,
			})

			if err != nil {
				return nil, err
			}

			return o, nil
		}

		return nil, err
	}

	existing.UpdateFromDraft(ctx, &dto, &draft)

	err = rr.db.Save(&existing).Error

	if err != nil {
		return nil, err
	}

	o.RequestInfo = &models.DraftRequestInfo{
		Name: existing.Name,
	}

	//update draft
	err = rr.updateDraftParents(id, map[string]any{
		"parent_request_id":    dto.RequestId,
		"parent_request_name":  dto.Name,
		"parent_collection_id": dto.CollectionId,
	})

	if err != nil {
		return nil, err
	}

	return o, nil
}

func (rr *RequestRepository) SaveRequestCopy(ctx context.Context, id string, dto models.SaveRequestCopyDTO) (string, error) {

	existing, err := rr.findSavedReq(ctx, id)

	if err != nil {
		return "", err
	}

	existing.Id = nanoid.Must()
	existing.Name = dto.Name

	err = rr.addSavedReq(ctx, &existing)

	if err != nil {
		return "", err
	}

	return existing.Id, nil
}

func (rr *RequestRepository) UpdateDraftFields(ctx context.Context, id string, dto models.UpdateDraftFieldsDTO) error {
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
		updates["body_type"] = *dto.BodyType
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
		updates["auth_type"] = *dto.AuthType
	}

	if dto.AuthEnabled != nil {
		updates["auth_enabled"] = *dto.AuthEnabled
	}

	if dto.BasicAuth != nil {
		updates["basic_auth"] = datatypes.JSON([]byte(*dto.BasicAuth))
	}

	if dto.ApiKeyAuth != nil {
		updates["api_key_auth"] = datatypes.JSON([]byte(*dto.ApiKeyAuth))
	}

	if dto.TokenAuth != nil {
		updates["token_auth"] = datatypes.JSON([]byte(*dto.TokenAuth))
	}

	if dto.LastTmpResponsePath != nil {
		updates["last_res_path"] = *dto.LastTmpResponsePath
	}

	if len(updates) == 0 {
		return nil
	}

	tx := rr.db.Model(&RequestDraft{}).Where("id = ?", id).Updates(updates)
	return tx.Error
}

func (rr *RequestRepository) FindSavedReqByCollectionId(ctx context.Context, collectionId string) ([]Request, error) {
	var requests []Request

	tx := rr.db.Where(&Request{
		CollectionId: collectionId,
		UserId:       utils.UserIdFromContext(ctx),
	}).Find(&requests)

	return requests, tx.Error
}

func (rr *RequestRepository) CreateRequestsInBatch(ctx context.Context, newRequests []Request) error {
	return gorm.G[Request](rr.db).CreateInBatches(ctx, &newRequests, 20)
}
