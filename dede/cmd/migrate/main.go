package main

import (
	"flag"
	"fmt"
	"log"
	"os"

	"eservice-backend/config"
	"eservice-backend/database"
	"eservice-backend/database/migrations"
)

func main() {
	var (
		version = flag.Bool("version", false, "Show version information")
		down    = flag.Bool("down", false, "Run down migrations (not implemented)")
	)
	flag.Parse()

	if *version {
		fmt.Println("Migration tool v1.0.0")
		os.Exit(0)
	}

	// Load configuration
	cfg := config.LoadConfig()

	// Initialize database
	fmt.Println("Connecting to database...")
	db, err := database.InitDB(cfg)
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatal("Failed to get database instance:", err)
	}
	defer sqlDB.Close()

	if *down {
		fmt.Println("Down migrations are not implemented yet")
		os.Exit(1)
	}

	// Run migrations
	fmt.Println("Running migrations...")
	if err := migrations.Migrate(db); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	fmt.Println("Migrations completed successfully!")
}
