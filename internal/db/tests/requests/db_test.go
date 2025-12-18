package requests_test

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

var storage *db.Storage
var testDb *gorm.DB

func TestMain(m *testing.M) {

	_, file, _, _ := runtime.Caller(0)

	baseDir := filepath.Dir(file)

	dsn := filepath.Join(baseDir, "requests_test.db")

	os.Remove(dsn)

	d, err := db.InitDb(dsn)

	if err != nil {
		panic(err)
	}

	d.AutoMigrate(&models.Collection{}, &models.Request{})
	testDb = d

	gorm.G[models.Collection](testDb).Create(context.Background(), &models.Collection{
		Id:   models.DEFAULT_COLLECTION,
		Name: "Drafts",
	})

	storage = db.NewTestStorage(d, context.Background())

	exitVal := m.Run()

	//cleanup
	//os.Remove(dsn)
	os.Exit(exitVal)
}

func TestAddCollection(t *testing.T) {

	wantId := "add_collection_test"

	err := storage.AddCollection(&models.Collection{
		Id:   wantId,
		Name: "Test Add collection",
	})

	if err != nil {
		t.Errorf("failed to add collection")
	}

	collection, err := storage.GetCollection(wantId)

	if err != nil {
		t.Errorf("failed to retrieve collection")
	}

	if collection.Id != wantId {
		t.Errorf("expected id %s, got %s", wantId, collection.Id)
	}
}

func TestAddReq(t *testing.T) {

	wantReqId := "add_req"

	r := &models.Request{
		Id:           wantReqId,
		CollectionId: models.DEFAULT_COLLECTION,
	}

	err := storage.AddReq(r)

	if err != nil {
		t.Errorf("failed to create request")
	}
}

func TestFindReq(t *testing.T) {

	wantReqId := "get_req"

	r := &models.Request{
		Id:           wantReqId,
		CollectionId: models.DEFAULT_COLLECTION,
	}

	err := storage.AddReq(r)

	if err != nil {
		t.Errorf("failed to create request")
	}

	got, err := storage.FindReq(wantReqId)

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

	r := &models.Request{
		Id:           wantReqId,
		CollectionId: models.DEFAULT_COLLECTION,
	}

	err := storage.AddReq(r)

	if err != nil {
		t.Errorf("failed to create request")
	}

	s, err := storage.UpdateReqHeaders(wantReqId, `[{"id":"1","key":"content-type","value":"application/json","enabled":"on"}]`)

	if err != nil {
		t.Errorf("failed to update headers request")
	}

	if !s {
		t.Errorf("failed to update headers request")
	}
}
