package db

import (
	"context"
	"gurl/shared/models"
	"gurl/shared/nanoid"
	"gurl/shared/utils"
	"os"
	"path/filepath"
	"runtime"
	"testing"

	"gorm.io/gorm"
)

var testDb *gorm.DB
var collctionRepo CollectionRepository
var uiRepo UiStateRepository

func TestMain(m *testing.M) {

	_, file, _, _ := runtime.Caller(0)

	baseDir := filepath.Dir(file)

	dsn := filepath.Join(baseDir, "test.db")

	d, err := InitDesktopDb(dsn)

	if err != nil {
		panic(err)
	}

	d.AutoMigrate(&UIState{}, &Collection{})
	testDb = d

	collctionRepo = *NewCollectionRepository(testDb)
	uiRepo = *NewUiStateRepository(testDb)
	exitVal := m.Run()

	//cleanup
	os.Remove(dsn)
	os.Exit(exitVal)
}

func TestInsertCollection(t *testing.T) {

	wantUser := "abc123"
	wantId := "new_collection"
	wantWorkSpace := "workspace"
	ctx := utils.ContextWithUserId(context.Background(), wantUser)

	err := collctionRepo.AddCollection(ctx, models.CreateCollectionDTO{
		Id:        wantId,
		Name:      "test-collection",
		Workspace: wantWorkSpace,
	})

	if err != nil {
		t.Error(err)
	}

	var foundCollection = new(Collection)

	testDb.Where(&Collection{
		UserId:      wantUser,
		WorkspaceId: wantWorkSpace,
	}).First(foundCollection)

	if foundCollection.Id == "" {
		t.Error("expected collection to return but got nil")
	}

	_, err = gorm.G[Collection](testDb).Where("id = ?", wantId).Delete(ctx)

	if err != nil {
		t.Fatalf("clean up failed after insert test")
	}

}

func TestGetCollections(t *testing.T) {

	//insert collections with 2 different users, search, it should return only collections for that user
	user1Ctx := utils.ContextWithUserId(context.Background(), "user1")
	user2Ctx := utils.ContextWithUserId(context.Background(), "user2")

	wantWorkspace := "common_workspace"

	err := collctionRepo.AddCollection(user1Ctx, models.CreateCollectionDTO{
		Id:        "user1_collection_1",
		Name:      "collection_1",
		Workspace: wantWorkspace,
	})

	if err != nil {
		t.Error(err)
	}

	err = collctionRepo.AddCollection(user1Ctx, models.CreateCollectionDTO{
		Id:        "user1_collection_2",
		Name:      "collection_2",
		Workspace: wantWorkspace,
	})

	if err != nil {
		t.Error(err)
	}

	err = collctionRepo.AddCollection(user2Ctx, models.CreateCollectionDTO{
		Id:        "user2_collection_1",
		Name:      "collection_1",
		Workspace: wantWorkspace,
	})

	if err != nil {
		t.Error(err)
	}

	collections, err := collctionRepo.GetAllCollections(user1Ctx, wantWorkspace)

	if len(collections) != 2 {
		t.Errorf("expected 2 collections to be found for user1 got %d", len(collections))
	}

	//expect to get all collections under workspace if user is not non-nill in the context
	allCollections, err := collctionRepo.GetAllCollections(context.Background(), wantWorkspace)

	if len(allCollections) != 3 {
		t.Errorf("expected 3 collections to be found under common workspace got %d", len(allCollections))
	}

}

func TestFindCollectionById(t *testing.T) {

	wantUserId := "find_by_id_user"
	wantCollectionId := "find_by_id_collection"

	ctx := utils.ContextWithUserId(context.Background(), wantUserId)

	err := collctionRepo.AddCollection(ctx, models.CreateCollectionDTO{
		Id:        wantCollectionId,
		Name:      "test",
		Workspace: "test_workspace",
	})

	if err != nil {
		t.Errorf("failed to setup test")
	}

	foundCollection, err := collctionRepo.FindCollectionById(ctx, wantCollectionId)

	if err != nil {
		t.Errorf("expected to find collection got error")
	}

	if foundCollection.Id != wantCollectionId {
		t.Errorf("expected to find collection #%s got %s", wantCollectionId, foundCollection.Id)
	}

}

func TestUiStateInitForUser(t *testing.T) {
	wantUser := "ui_init_user"
	wantId := nanoid.Must()

	ctx := utils.ContextWithUserId(context.Background(), wantUser)

	err := uiRepo.InitializeUIStateForUser(ctx, wantId)

	if err != nil {
		t.Error("failed to setup")
	}

	uiState, err := gorm.G[UIState](testDb).Where("id = ?", wantId).First(t.Context())

	if err != nil {
		t.Error("expected to get ui state got error")
	}

	if uiState.UserId != wantUser {
		t.Errorf("expected ui state to have userid %s got %s", wantUser, uiState.UserId)
	}
}

func TestUiStateUpdateForUser(t *testing.T) {

	wantUser := "ui_update_user"
	wantId := nanoid.Must()

	ctx := utils.ContextWithUserId(context.Background(), wantUser)

	err := uiRepo.InitializeUIStateForUser(ctx, wantId)

	if err != nil {
		t.Error("failed to setup")
	}

	updatedLayout := "h"
	updatedSidebarState := true

	err = uiRepo.UpdateUIStateForUser(ctx, models.UpdateUIStateDTO{
		Layout:        &updatedLayout,
		IsSidebarOpen: &updatedSidebarState,
	})

	if err != nil {
		t.Error("expected update to succeed but failed")
	}

	updatedUiState, err := gorm.G[UIState](testDb).Where("id = ?", wantId).First(t.Context())

	if err != nil {
		t.Error("expected to find state but failed")
	}

	if updatedUiState.Layout != updatedLayout || updatedUiState.IsSidebarOpen != updatedSidebarState {
		t.Error("update failed")
	}
}
