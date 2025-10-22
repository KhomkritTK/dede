# Build Instructions

This project has multiple main functions in different directories:
- `main.go` - The main application server
- `cmd/migrate/main.go` - Database migration tool

## Building the Main Application

To build the main application, use one of these methods:

1. Using Makefile (recommended):
   ```bash
   make build
   ```

2. Direct Go command:
   ```bash
   go build -o bin/app ./main.go
   ```

## Running the Application

1. Using Makefile (recommended):
   ```bash
   make run
   ```

2. Direct Go command:
   ```bash
   go run ./main.go
   ```

3. Development with hot reload:
   ```bash
   make dev
   ```

## Running Migrations

To run database migrations:

1. Using Makefile (recommended):
   ```bash
   make migrate
   ```

2. Direct Go command:
   ```bash
   go run ./cmd/migrate/main.go
   ```

## Important Note

Do NOT use `go run .` or `go build .` in the backend directory, as this will try to compile all Go files in the module, including both main functions, which will result in a "main redeclared" error.