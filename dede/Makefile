.PHONY: help build run migrate clean

# Default target
help:
	@echo "Available commands:"
	@echo "  build     - Build the application"
	@echo "  run       - Run the application"
	@echo "  migrate   - Run database migrations"
	@echo "  clean     - Clean build artifacts"

# Build the application
build:
	@echo "Building application..."
	go build -o bin/app main.go

# Run the application
run: build
	@echo "Starting application..."
	./bin/app

# Run database migrations
migrate:
	@echo "Running database migrations..."
	go run cmd/migrate/main.go

# Build migration tool
build-migrate:
	@echo "Building migration tool..."
	go build -o bin/migrate cmd/migrate/main.go

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf bin/