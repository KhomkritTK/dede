.PHONY: help build runf dev clean

# Default target
help:
	@echo "Available commands:"
	@echo "  build     - Build the application"
	@echo "  runf      - Run the frontend server on port 3000"
	@echo "  dev       - Run the frontend with hot reload"
	@echo "  clean     - Clean build artifacts"

# Build the application
build:
	@echo "Building frontend application..."
	npm run build

# Run the frontend server on port 3000
runf:
	@echo "Starting frontend server on port 3000..."
	@lsof -ti:3000 | xargs kill -9 2>/dev/null || true
	cd .. && npm run dev --prefix frontend

# Run the frontend with hot reload
dev:
	@echo "Starting frontend with hot reload..."
	npm run dev

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf .next/
	rm -rf out/
	rm -rf build/