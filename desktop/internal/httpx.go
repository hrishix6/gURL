package internal

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"sync"
)

type HttpServer struct {
	cleanupWG *sync.WaitGroup
	srv       *http.Server
	Addr      string
}

func NewHttpServer() *HttpServer {
	return &HttpServer{
		cleanupWG: &sync.WaitGroup{},
	}
}

func (hs *HttpServer) Startup(handler http.Handler) error {
	log.Println("[HttpServer] Initialization Started")

	log.Println("[HttpServer] Starting HTTP Listner at ", hs.Addr)

	hs.srv = &http.Server{
		Addr:    fmt.Sprintf(":%d", SERVER_PORT),
		Handler: handler,
	}

	hs.cleanupWG.Add(1)

	go func() {
		defer hs.cleanupWG.Done()

		if err := hs.srv.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("Serve(): %v", err)
		}

		log.Println(`[HttpServer] Server Shutdown finished`)
	}()

	log.Println("[HttpServer] Initialization Completed")

	return nil
}

func (hs *HttpServer) Shutdown(ctx context.Context) {
	log.Println("[HttpServer] Shutdown stated")

	hs.srv.Shutdown(ctx)

	hs.cleanupWG.Wait()

	log.Println("[HttpServer] Shutdown Completed")
}
