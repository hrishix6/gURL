.DEFAULT_GOAL := build
.PHONY:fmt vet build
-include .env
export

fmt:
		go fmt ./...

vet: fmt
		go vet ./...

clean: vet
		rm -rf build/bin/*

gen:  vet
		wails generate module

build: clean
		wails build -tags webkit2_41

dev: vet
		wails dev -tags webkit2_41 -skipbindings