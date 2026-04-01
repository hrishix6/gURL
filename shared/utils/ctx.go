package utils

import "context"

type UserIdKey int

const (
	userId UserIdKey = iota
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
