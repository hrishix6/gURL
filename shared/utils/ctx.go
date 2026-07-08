package utils

import (
	"context"
)

type UserCtxKey string

const (
	userId          UserCtxKey = "userId"
	workspacesKey   UserCtxKey = "userWorkspaces"
	CollectionIdKey UserCtxKey = "userCollectionId"
)

func UserIdFromContext(ctx context.Context) string {
	u, ok := ctx.Value(userId).(string)

	if !ok {
		return ""
	}

	return u
}

func ContextWithUserId(ctx context.Context, userIdVal string) context.Context {
	return context.WithValue(ctx, userId, userIdVal)
}

func CollectionIdFromContext(ctx context.Context) string {
	c, ok := ctx.Value(CollectionIdKey).(string)

	if !ok {
		return ""
	}

	return c
}

func ContextWithCollectionId(ctx context.Context, collectionId string) context.Context {
	return context.WithValue(ctx, CollectionIdKey, collectionId)
}

// func UserWorkspacesFromContext(ctx context.Context) []models.WorkspaceContextItem {
// 	w, ok := ctx.Value(workspacesKey).(string)

// 	if !ok {
// 		return []models.WorkspaceContextItem{}
// 	}

// 	var items []models.WorkspaceContextItem

// 	pairs := strings.Split(w, ",")

// 	for _, pair := range pairs {

// 		pair = strings.TrimSpace(pair)

// 		parts := strings.Split(pair, ":")

// 		if len(parts) != 2 {
// 			continue
// 		}

// 		items = append(items, models.WorkspaceContextItem{
// 			Id:   parts[0],
// 			Role: parts[1],
// 		})
// 	}

// 	return items
// }

// func ContextWithWorkspaces(ctx context.Context, workspaces []models.WorkspaceContextItem) context.Context {

// 	var v []string

// 	for _, w := range workspaces {
// 		v = append(v, fmt.Sprintf("%s:%s", w.Id, w.Role))
// 	}

// 	return context.WithValue(ctx, workspacesKey, strings.Join(v, ","))
// }
