package storage

import (
	"gurl/shared/models"
)

func (s *DesktopStorage) AddReqExample(dto models.ReqExampleDTO, meta models.SavedResponseRenderMeta) error {
	return s.reqExampleRepo.AddReqExample(s.appCtx, dto, meta, s.tmpDir, s.persistDir)
}

func (s *DesktopStorage) GetReqExampleById(id string) (*models.ReqExampleDTO, error) {
	return s.reqExampleRepo.GetReqExampleById(s.appCtx, id)
}

func (s *DesktopStorage) GetReqExamples(query models.ReqExampleQueryDTO) ([]models.ReqExampleLightDTO, error) {

	return s.reqExampleRepo.GetReqExamples(s.appCtx, query)
}

func (s *DesktopStorage) DeleteReqExample(id string) error {
	return s.reqExampleRepo.DeleteReqExample(s.appCtx, id)
}

func (s *DesktopStorage) CreateMockFromExample(exampleId string, dto models.CreateMockDTO) (*models.MockLightDTO, error) {
	return s.reqMockRepo.CreateMockFromExample(s.appCtx, dto, exampleId)
}
