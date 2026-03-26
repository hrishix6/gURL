package db

import (
	"context"
	"errors"
	"gurl/shared/models"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Request struct {
	BaseEntity
	RequestCore
	Name         string     `gorm:"column:name;not null"`
	CollectionId string     `gorm:"not null"`
	Collection   Collection `gorm:"constraint:OnDelete:CASCADE;"`
	WorkspaceId  string     `gorm:"column:workspace_id;default:null"`
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

func (r *Request) FromRequestDraft(payload *models.SaveDraftAsReqDTO, dto *RequestDraft) {
	if r == nil {
		r = &Request{}
	}

	r.Id = payload.RequestId
	r.CollectionId = payload.CollectionId
	r.WorkspaceId = payload.WorkspaceId
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
	return gorm.G[Request](rr.db).Where("id = ?", id).First(ctx)
}

func (rr *RequestRepository) DeleteSavedReq(ctx context.Context, id string) error {
	_, err := gorm.G[Request](rr.db).Where("id = ?", id).Delete(ctx)
	return err
}

func (rr *RequestRepository) findDraft(ctx context.Context, id string) (RequestDraft, error) {
	return gorm.G[RequestDraft](rr.db).Where("id = ?", id).First(ctx)
}

func (rr *RequestRepository) RemoveDraft(ctx context.Context, id string) error {
	_, err := gorm.G[RequestDraft](rr.db).Where("id = ?", id).Delete(ctx)

	if err != nil {
		return err
	}

	return nil
}

func (rr *RequestRepository) GetSavedRequests(ctx context.Context, workspaceId string) ([]models.RequestLightDTO, error) {

	records, err := gorm.G[Request](rr.db).Where("workspace_id = ?", workspaceId).Find(ctx)

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

func (rr *RequestRepository) FindDraftById(ctx context.Context, id string) (*models.RequestDraftDTO, error) {
	found, err := gorm.G[RequestDraft](rr.db).Where("id = ?", id).First(ctx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return found.ToRequestDraftDTO(), nil
}

func (rr *RequestRepository) AddFreshDraft(ctx context.Context, dto models.AddDraftDTO) error {
	return gorm.G[RequestDraft](rr.db).Create(ctx, &RequestDraft{
		BaseEntity: BaseEntity{
			Id: dto.Id,
		},
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
	tx := rr.db.Model(&RequestDraft{}).Where("parentCollectionId = ?", collectionId).Updates(map[string]any{
		"parentRequestId":    "",
		"parentRequestName":  "",
		"parentCollectionId": "",
	})

	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

func (rr *RequestRepository) DeleteRequestDrafts(ctx context.Context, requestId string) error {
	tx := rr.db.Model(&RequestDraft{}).Where("parentRequestId = ?", requestId).Updates(map[string]any{
		"parentRequestId":    "",
		"parentRequestName":  "",
		"parentCollectionId": "",
	})

	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

func (rr *RequestRepository) SaveDraftAsRequest(ctx context.Context, id string, dto models.SaveDraftAsReqDTO) error {

	draft, err := rr.findDraft(ctx, id)

	if err != nil {
		return err
	}

	//update draft
	err = rr.updateDraftParents(id, map[string]any{
		"parentRequestId":    dto.RequestId,
		"parentRequestName":  dto.Name,
		"parentCollectionId": dto.CollectionId,
	})

	if err != nil {
		return err
	}

	existing, err := rr.findSavedReq(ctx, dto.RequestId)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			req := &Request{}
			req.FromRequestDraft(&dto, &draft)

			createErr := rr.addSavedReq(ctx, req)

			if createErr != nil {
				return createErr
			}

			return nil
		} else {
			return err
		}
	}

	//delete existing req and instead create new record.
	err = rr.DeleteSavedReq(ctx, existing.Id)

	if err != nil {
		return err
	}

	//create new saved request with same id and new data
	req := &Request{}

	req.FromRequestDraft(&dto, &draft)

	createErr := rr.addSavedReq(ctx, req)

	if createErr != nil {
		return createErr
	}

	return nil
}

func (rr *RequestRepository) SaveRequestCopy(ctx context.Context, id string, dto models.SaveRequestCopyDTO) error {

	existing, err := rr.findSavedReq(ctx, id)

	if err != nil {
		return err
	}

	existing.Id = dto.Id
	existing.Name = dto.Name

	createErr := rr.addSavedReq(ctx, &existing)

	if createErr != nil {
		return createErr
	}

	return nil
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

	tx := rr.db.Model(&RequestDraft{}).Where("id = ?", id).Updates(updates)
	return tx.Error
}

func (rr *RequestRepository) FindSavedReqByCollectionId(ctx context.Context, collectionId string) ([]Request, error) {
	return gorm.G[Request](rr.db).Where("collection_id = ?", collectionId).Order("created desc").Find(ctx)
}

func (rr *RequestRepository) CreateRequestsInBatch(ctx context.Context, newRequests []Request) error {
	return gorm.G[Request](rr.db).CreateInBatches(ctx, &newRequests, 20)
}
