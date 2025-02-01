.PHONY: build vet fmt
build: vet
	go build -o ./dist/server

vet: fmt
	go vet

fmt:
	go fmt
