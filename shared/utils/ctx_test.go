package utils

// func TestUserIdAndWorkspacesCtx(t *testing.T) {

// 	wantUserID := "user_1"

// 	parent := ContextWithUserId(context.Background(), wantUserID)

// 	wantWorkspaces := []models.WorkspaceContextItem{
// 		{
// 			Id:   "workspace_1",
// 			Role: "o",
// 		},
// 		{
// 			Id:   "workspace_2",
// 			Role: "u",
// 		},
// 	}

// 	ctx := ContextWithWorkspaces(parent, wantWorkspaces)

// 	gotUser := UserIdFromContext(ctx)

// 	if gotUser != wantUserID {
// 		t.Error("expected to found userid")
// 	}

// 	got := UserWorkspacesFromContext(ctx)

// 	if len(got) != len(wantWorkspaces) {
// 		t.Error("expected 2 workspaces in context")
// 	}

// 	// slices.SortFunc(got, func(a, b models.WorkspaceContextItem) int {
// 	// 	return strings.Compare(a.Id, b.Id)
// 	// })

// 	if got[0].Id != wantWorkspaces[0].Id || got[0].Role != wantWorkspaces[0].Role {
// 		t.Error("invalid parsing")
// 	}

// 	if got[1].Id != wantWorkspaces[1].Id || got[1].Role != wantWorkspaces[1].Role {
// 		t.Error("invalid parsing")
// 	}

// }
