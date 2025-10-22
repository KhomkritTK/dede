.PHONY: help build run dev migrate clean seed

# Default target
help:
	@echo "Available commands:"
	@echo "  build     - Build the application"
	@echo "  run       - Run the application"
	@echo "  dev       - Run the application with hot reload using Air"
	@echo "  migrate   - Run database migrations"
	@echo "  seed      - Seed database with sample data"
	@echo "  clean     - Clean build artifacts"

# Build the application
build:
	@echo "Building application..."
	go build -o bin/app ./main.go

# Run the application
run:
	@echo "Starting application..."
	@lsof -ti:8080 | xargs kill -9 2>/dev/null || true
	go run ./main.go

# Run database migrations
migrate:
	@echo "Running database migrations..."
	go run cmd/migrate/main.go

# Build migration tool
build-migrate:
	@echo "Building migration tool..."
	go build -o bin/migrate cmd/migrate/main.go

# Seed database with sample data
seed:
	@echo "Seeding database with sample data..."
	go run cmd/seed/main.go

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf bin/

# Run the application with hot reload
dev:
	@echo "Starting application with hot reload..."
	@lsof -ti:8080 | xargs kill -9 2>/dev/null || true
	/Users/cms-rd-1/go/bin/air

run-dev:
	@lsof -ti:8080 | xargs kill -9 2>/dev/null || true
	go run ./main.go