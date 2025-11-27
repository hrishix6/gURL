.DEFAULT_GOAL := build
.PHONY:fmt vet build
fmt:
		go fmt ./...

vet: fmt
		go vet ./...

clean: vet
		rm -rf build/bin/*

build: clean
		wails build -tags webkit2_41

dev: clean
		wails dev -tags webkit2_41