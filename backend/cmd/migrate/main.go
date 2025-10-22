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
		fmt.Println("Dropping all tables...")
		if err := db.Migrator().DropTable(
			"users", "corporates", "corporate_members", "user_profiles", "otps",
			"license_requests", "new_license_requests", "renewal_license_requests",
			"extension_license_requests", "reduction_license_requests", "inspections",
			"audit_reports", "attachments", "notifications", "service_flow_logs",
			"admin_users", "task_assignments", "audit_report_versions", "workflow_comments",
			"deadline_reminders", "role_dashboards", "workflow_metrics",
		); err != nil {
			log.Fatal("Failed to drop tables:", err)
		}
		fmt.Println("Tables dropped successfully!")
		return
	}

	// Run migrations
	fmt.Println("Running migrations...")
	if err := migrations.Migrate(db); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	fmt.Println("Migrations completed successfully!")
}
