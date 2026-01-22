package storage

import (
	"context"
	"fmt"
	"gurl/internal/db"
	"gurl/internal/models"
	"os"
	"path/filepath"
	"runtime"
	"testing"

	"gorm.io/gorm"
)

var storage Storage
var testDb *gorm.DB

func TestMain(m *testing.M) {

	_, file, _, _ := runtime.Caller(0)

	baseDir := filepath.Dir(file)

	dsn := filepath.Join(baseDir, "storage.db")

	os.Remove(dsn)

	d, err := db.InitDb(dsn)

	if err != nil {
		panic(err)
	}

	d.AutoMigrate(&db.Collection{}, &db.RequestDraft{}, &db.MimeRecord{})
	testDb = d

	gorm.G[db.Collection](testDb).Create(context.Background(), &db.Collection{
		Id:   db.DEFAULT_COLLECTION_ID,
		Name: db.DEFAULT_COLLECTION_NAME,
	})

	storage = NewTestStorage(d, context.Background())

	exitVal := m.Run()

	//cleanup
	os.Remove(dsn)
	os.Exit(exitVal)
}

func TestAddCollection(t *testing.T) {

	wantId := "add_collection_test"

	err := storage.insertCollection(&db.Collection{
		Id:   wantId,
		Name: "Test Add collection",
	})

	if err != nil {
		t.Errorf("failed to add collection")
	}

	collection, err := gorm.G[db.Collection](testDb).Where("id = ?", wantId).First(storage.appCtx)

	if err != nil {
		t.Errorf("failed to retrieve collection")
	}

	if collection.Id != wantId {
		t.Errorf("expected id %s, got %s", wantId, collection.Id)
	}
}

func TestAddReq(t *testing.T) {

	wantReqId := "add_req"

	r := &models.AddFreshDraftDTO{
		Id: wantReqId,
	}

	err := storage.AddFreshDraft(*r)

	if err != nil {
		t.Errorf("failed to create request")
	}
}

func TestFindDraft(t *testing.T) {

	wantReqId := "get_req"

	r := &models.AddFreshDraftDTO{
		Id: wantReqId,
	}

	err := storage.AddFreshDraft(*r)

	if err != nil {
		t.Errorf("failed to create request")
	}

	got, err := storage.findDraft(wantReqId)

	if err != nil {
		t.Errorf("failed to find request %s", err.Error())
	}

	if got.Id != wantReqId {
		t.Errorf("expected %s got %s", wantReqId, got.Id)
	}

	gotHeaders := string(got.Headers)

	if gotHeaders != `[]` {
		t.Errorf("expected [] got %s", gotHeaders)
	}

	fmt.Printf(`received binary bot json as "%s"`, string(got.BinaryBody))
}

func TestUpdateReqHeaders(t *testing.T) {

	wantReqId := "update_header_test"

	r := &models.AddFreshDraftDTO{
		Id: wantReqId,
	}

	err := storage.AddFreshDraft(*r)

	if err != nil {
		t.Errorf("failed to create request")
	}

	err = storage.UpdateDraftHeaders(
		models.UpdateDraftHeadersDTO{
			RequestId:   wantReqId,
			HeadersJSON: `[{"id":"1","key":"content-type","value":"application/json","enabled":"on"}]`,
		})

	if err != nil {
		t.Errorf("failed to update headers request")
	}
}
