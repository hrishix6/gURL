.DEFAULT_GOAL := build
.PHONY:fmt vet build clean gen dev

STATIC_DIR := ../shared/assets/static

include desktop.env.local
export

fmt:
		go fmt ./...

vet: fmt
		go vet ./...

clean: vet
		rm -rf $(STATIC_DIR) && mkdir -p $(STATIC_DIR) && rm -rf build/bin/*

gen:  vet
		wails generate module

build: clean
		wails build -tags webkit2_41

dev: vet
		wails dev -tags webkit2_41 -skipbindings