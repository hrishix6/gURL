.DEFAULT_GOAL := build
.PHONY:fmt vet dev

include web.env.local
export

db:		
		docker compose -f compose.local.yaml --env-file .env.local up -d

fmt:    db
		go fmt ./...
		
vet:	fmt
		go vet ./...

dev:	vet
		go run .
