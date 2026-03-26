package storage

import (
	"context"
	"encoding/json"
	"fmt"
	"gurl/shared/db"
	"gurl/shared/models"
	"os"
	"path/filepath"
	"runtime"
	"testing"

	"gorm.io/gorm"
)

var storage DesktopStorage
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

	storage = NewTestStorage(d, context.Background())
	exitVal := m.Run()

	//cleanup
	os.Remove(dsn)
	os.Exit(exitVal)
}

func TestAddCollection(t *testing.T) {

	wantId := "add_collection_test"

	err := storage.AddCollection(models.CreateCollectionDTO{
		Id:        wantId,
		Name:      "Test Add collection",
		Workspace: "test_workspace",
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

	r := &models.AddDraftDTO{
		Id: wantReqId,
	}

	err := storage.AddFreshDraft(*r)

	if err != nil {
		t.Errorf("failed to create request")
	}
}

func TestFindDraft(t *testing.T) {

	wantReqId := "get_req"

	r := &models.AddDraftDTO{
		Id: wantReqId,
	}

	err := storage.AddFreshDraft(*r)

	if err != nil {
		t.Errorf("failed to create request")
	}

	got, err := storage.FindDraftById(wantReqId)

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

func TestUpdateDraftFields(t *testing.T) {

	wantDraftId := "update_draftFields_partial"

	r := &models.AddDraftDTO{
		Id: wantDraftId,
	}

	err := storage.AddFreshDraft(*r)

	if err != nil {
		t.Errorf("failed to create draft")
	}

	uiPayload1 := `{
		"headersJson" : "[{\"id\":\"1\",\"key\":\"content-type\",\"value\":\"txt\",\"enabled\":\"on\"}]"
	}`

	fmt.Print(uiPayload1)

	var parsedPayload models.UpdateDraftFieldsDTO

	err = json.Unmarshal([]byte(uiPayload1), &parsedPayload)

	if err != nil {
		t.Fatalf("invalid ui payload json %v", err)
	}

	err = storage.UpdateDraftFields(wantDraftId, parsedPayload)

	if err != nil {
		t.Fatalf("failed to update headers")
	}

	draft, _ := storage.FindDraftById(wantDraftId)

	gotHeaders := string(draft.Headers)

	if gotHeaders == "" || gotHeaders == "[]" {
		t.Errorf("expected headers to be updated but they did not")
	}

	var parsedPayload2 models.UpdateDraftFieldsDTO

	uiPayload2 := `{
		"queryJson": "[{\"id\":\"1\",\"key\":\"content-type\",\"value\":\"txt\",\"enabled\":\"on\"}]"
	}`

	err = json.Unmarshal([]byte(uiPayload2), &parsedPayload2)

	if err != nil {
		t.Fatalf("invalid ui payload json %v", err)
	}

	err = storage.UpdateDraftFields(wantDraftId, parsedPayload2)

	if err != nil {
		t.Fatalf("subsequent update failed for updating query")
	}

	draft2, _ := storage.FindDraftById(wantDraftId)

	gotHeaders2 := string(draft2.Headers)
	gotquery := string(draft2.Headers)

	if gotHeaders2 == "" || gotHeaders2 == "[]" {
		t.Errorf("expected headers to not be updated but they did")
	}

	if gotquery == "" || gotquery == "[]" {
		t.Errorf("expected query params to be updated but they did not")
	}

}
