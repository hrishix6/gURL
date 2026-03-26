.DEFAULT_GOAL := build
.PHONY:fmt vet build clean gen dev

FRONTEND_DIR := ../frontend
STATIC_DIR := ../shared/assets/static

include web.env.local
export

clean:
		rm -rf $(STATIC_DIR) && mkdir -p $(STATIC_DIR)

build:	clean
		cd $(FRONTEND_DIR) && pnpm run web-dev-build

fmt:	build
		go fmt ./...

vet:	fmt
		go vet ./...

dev:	vet
		go run .
