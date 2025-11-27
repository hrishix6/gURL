package main

import (
	"context"
	"encoding/base64"
	"fmt"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet2(name string) string {

	greeting := fmt.Sprintf(`Hello %s, It's show time!`, name)

	return base64.StdEncoding.EncodeToString([]byte(greeting))
}
