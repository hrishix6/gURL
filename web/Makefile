.DEFAULT_GOAL := build
.PHONY:fmt vet dev

db:		
		docker compose -f compose.local.yaml --env-file .env.local up -d

fmt:    db
		go fmt ./...
		
vet:	fmt
		go vet ./...

dev:	vet
		CFG_FILE=web.env.local.json go run .
