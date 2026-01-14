package utils

import (
	"os"
	"path/filepath"
)

func InitTempDir(appDataDir string) (string, error) {

	base := os.TempDir()

	TempDir := filepath.Join(base, appDataDir, "temp")

	if err := os.MkdirAll(TempDir, 0o755); err != nil {
		return "", err
	}

	err := CleanupTempDir(TempDir)

	if err != nil {
		return "", err
	}

	return TempDir, nil
}

func CleanupTempDir(tempDir string) error {
	entries, err := os.ReadDir(tempDir)
	if err != nil {
		return err
	}

	for _, entry := range entries {
		path := filepath.Join(tempDir, entry.Name())
		os.RemoveAll(path)
	}

	return nil
}

func InitDataDir(appDataDir string) (string, error) {

	base, err := os.UserConfigDir()

	if err != nil {
		return "", err
	}

	dataDir := filepath.Join(base, appDataDir)

	if err := os.MkdirAll(dataDir, 0o755); err != nil {
		return "", err
	}

	return dataDir, nil
}
