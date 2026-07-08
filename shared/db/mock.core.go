package db

import (
	"encoding/json"
	"fmt"
	"gurl/shared/models"
	"io"
	"os"
	"path/filepath"

	"gorm.io/datatypes"
)

type MockCore struct {
	Method string `gorm:"column:method;default:GET"`
	Path   string `gorm:"column:path;not null"`

	BodyType      string         `gorm:"column:body_type;default:none"`
	TextBody      string         `gorm:"column:textbody"`
	BinaryBody    datatypes.JSON `gorm:"column:binarybody"`
	EnvironmentId string         `gorm:"column:environment_id;default:''"`

	ResponseStatus  int64          `gorm:"column:response_status;default:200"`
	ResponseDelayS  int64          `gorm:"column:response_delay_seconds;default:0"`
	ResponseHeaders datatypes.JSON `gorm:"column:response_headers;default:'[]'"`
}

func (mc MockCore) ToMockCoreDTO() models.MockCoreDTO {
	return models.MockCoreDTO{
		Path:            mc.Path,
		Method:          mc.Method,
		TextBody:        mc.TextBody,
		BinaryBody:      string(mc.BinaryBody),
		BodyType:        mc.BodyType,
		EnvironmentId:   mc.EnvironmentId,
		ResponseStatus:  mc.ResponseStatus,
		ResponseDelayS:  mc.ResponseDelayS,
		ResponseHeaders: string(mc.ResponseHeaders),
	}
}

func (mc MockCore) FromMockCoreDto(dto models.MockCoreDTO) (MockCore, error) {

	return MockCore{
		Path:            dto.Path,
		Method:          dto.Method,
		BodyType:        dto.BodyType,
		TextBody:        dto.TextBody,
		BinaryBody:      datatypes.JSON(dto.BinaryBody),
		EnvironmentId:   dto.EnvironmentId,
		ResponseStatus:  dto.ResponseStatus,
		ResponseDelayS:  dto.ResponseDelayS,
		ResponseHeaders: datatypes.JSON([]byte(dto.ResponseHeaders)),
	}, nil
}

func (mc MockCore) CopyMockCore(copyId string) (*MockCore, error) {

	copy := MockCore{
		Method:          mc.Method,
		Path:            mc.Path,
		ResponseStatus:  mc.ResponseStatus,
		ResponseHeaders: mc.ResponseHeaders,
		ResponseDelayS:  mc.ResponseDelayS,
		BodyType:        mc.BodyType,
		TextBody:        mc.TextBody,
	}

	if string(mc.BinaryBody) != "" {

		var binaryB models.FileStats

		err := json.Unmarshal(mc.BinaryBody, &binaryB)

		if err != nil {
			return nil, err
		}

		srcF, err := os.Open(binaryB.Path)

		if err != nil {
			return nil, err
		}

		defer srcF.Close()

		dstDir := filepath.Dir(binaryB.Path)
		dstExt := filepath.Ext(binaryB.Path)

		dstFileName := fmt.Sprintf("gurl-mock-%s%s", copyId, dstExt)

		dst := filepath.Join(dstDir, dstFileName)

		dstF, err := os.Create(dst)

		if err != nil {
			return nil, err
		}

		defer dstF.Close()

		n, err := io.Copy(dstF, srcF)

		copiedBinaryB := &models.FileStats{
			Name: dstFileName,
			Size: n,
			Path: dst,
		}

		b, err := json.Marshal(copiedBinaryB)

		if err != nil {
			return nil, err
		}

		copy.BinaryBody = b
	}

	return &copy, nil
}
