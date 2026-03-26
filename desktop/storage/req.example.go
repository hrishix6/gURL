package storage

import (
	"gurl/shared/models"
)

func (s *DesktopStorage) AddReqExample(dto models.ReqExampleDTO, meta models.SavedResponseRenderMeta) error {
	return s.reqExampleRepo.AddReqExample(s.appCtx, dto, meta, s.savedResponsesDir)
}

func (s *DesktopStorage) GetReqExampleById(id string) (*models.ReqExampleDTO, error) {
	return s.reqExampleRepo.GetReqExampleById(s.appCtx, id)
}

func (s *DesktopStorage) GetReqExamples(workspaceId string) ([]models.ReqExampleLightDTO, error) {

	return s.reqExampleRepo.GetReqExamples(s.appCtx, workspaceId)
}

func (s *DesktopStorage) DeleteReqExample(id string) error {
	return s.reqExampleRepo.DeleteReqExample(s.appCtx, id)
}
