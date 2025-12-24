package mimedb_test

import (
	"context"
	"gurl/internal/db"
	"gurl/internal/models"
	"os"
	"path/filepath"
	"runtime"
	"testing"

	"gorm.io/gorm"
)

var storage *db.Storage
var testDb *gorm.DB

func TestMain(m *testing.M) {

	_, file, _, _ := runtime.Caller(0)

	baseDir := filepath.Dir(file)

	dsn := filepath.Join(baseDir, "mimedb_test.db")

	os.Remove(dsn)

	d, err := db.InitDb(dsn)

	if err != nil {
		panic(err)
	}

	d.AutoMigrate(&models.MimeRecord{})
	testDb = d

	storage = db.NewTestStorage(d, context.Background())

	exitVal := m.Run()

	//cleanup
	os.Remove(dsn)
	os.Exit(exitVal)
}

func TestBulkAddMimeRecords(t *testing.T) {

	mimeDbMap := make(map[string]models.MimeData)

	mimeDbMap["bulkaddtest/json"] = models.MimeData{
		Source:     "iana",
		Extensions: []string{"json", "map"},
	}

	mimeDbMap["bulkaddtest/xml"] = models.MimeData{
		Source:     "iana",
		Extensions: []string{"xml", "xsl", "xsd", "rng"},
	}

	err := storage.BulkAddMimeRecords(mimeDbMap, 20)

	if err != nil {
		t.Errorf("failed to bulk add mime records")
	}

}

func TestLookupMimeRecord(t *testing.T) {

	mimeDbMap := make(map[string]models.MimeData)

	mimeDbMap["application/json"] = models.MimeData{
		Source:     "iana",
		Extensions: []string{"json", "map"},
	}

	mimeDbMap["application/xml"] = models.MimeData{
		Source:     "iana",
		Extensions: []string{"xml", "xsl", "xsd", "rng"},
	}

	err := storage.BulkAddMimeRecords(mimeDbMap, 20)

	if err != nil {
		t.Errorf("failed to bulk add mime records %s", err.Error())
	}

	//search by id
	wantId := "application/json"

	got, err := storage.LookupMimeRecord(wantId)

	if err != nil {
		t.Errorf("failed to get mime record %s", err.Error())
	}

	if got.Id != wantId {
		t.Errorf("expected to find %s got %s", wantId, got.Id)
	}

}
