package utils

import (
	"fmt"
	"gurl/shared/models"
	"os"
	"path/filepath"
)

func InitTempDir(appDataDir string, tmpDirLocation string) (string, error) {

	TempDir := filepath.Join(appDataDir, tmpDirLocation)

	if err := os.MkdirAll(TempDir, 0o755); err != nil {
		return "", err
	}

	return TempDir, nil
}

func InitDataDir(appDataDir string) error {
	dataDir := filepath.Join(appDataDir)

	if err := os.MkdirAll(dataDir, 0o755); err != nil {
		return err
	}

	return nil
}

func InitWebTempDir(appDataDir string, webuploadDir string) (string, error) {

	webTempDir := filepath.Join(appDataDir, webuploadDir)

	if err := os.MkdirAll(webTempDir, 0o755); err != nil {
		return "", err
	}

	return webTempDir, nil
}

func InitSavedResponsesDir(appDataDir string, savedResponsesDir string) (string, error) {

	responsesDir := filepath.Join(appDataDir, savedResponsesDir)

	if err := os.MkdirAll(responsesDir, 0o755); err != nil {
		return "", err
	}

	return responsesDir, nil
}

func GetFileStats(filePath string) (*models.FileStats, error) {
	info, err := os.Stat(filePath)

	if err != nil {
		return nil, err
	}

	if info.IsDir() {
		return nil, fmt.Errorf("chosen item is not a file")
	}

	return &models.FileStats{
		Name: info.Name(),
		Size: info.Size(),
		Path: filePath,
	}, nil
}
