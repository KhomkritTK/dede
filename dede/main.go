package main

import (
	"log"
	"os"

	"eservice-backend/config"
	"eservice-backend/database"
	"eservice-backend/database/migrations"
	"eservice-backend/router"
	"eservice-backend/server"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.LoadConfig()

	// Initialize database
	db, err := database.InitDB(cfg)
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	// Run migrations
	if err := migrations.Migrate(db); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	// Initialize Gin router
	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()

	// Setup routes
	router.SetupRoutes(r, db, cfg)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = cfg.ServerPort
	}

	log.Printf("Server starting on port %s", port)
	if err := server.StartServer(r, port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
