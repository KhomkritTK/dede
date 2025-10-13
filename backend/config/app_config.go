package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Env        string
	ServerPort string
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	JWTSecret  string
	JWTExpiry  string
	EmailFrom  string
	EmailHost  string
	EmailPort  string
	EmailUser  string
	EmailPass  string
	UploadPath string
}

func LoadConfig() *Config {
	// Load .env file if exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	return &Config{
		Env:        getEnv("ENV", "development"),
		ServerPort: getEnv("SERVER_PORT", "8080"),
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "postgres"),
		DBPassword: getEnv("DB_PASSWORD", "password"),
		DBName:     getEnv("DB_NAME", "eservice_db"),
		JWTSecret:  getEnv("JWT_SECRET", "your-secret-key"),
		JWTExpiry:  getEnv("JWT_EXPIRY", "24h"),
		EmailFrom:  getEnv("EMAIL_FROM", "noreply@eservice.go.th"),
		EmailHost:  getEnv("EMAIL_HOST", "smtp.gmail.com"),
		EmailPort:  getEnv("EMAIL_PORT", "587"),
		EmailUser:  getEnv("EMAIL_USER", ""),
		EmailPass:  getEnv("EMAIL_PASS", ""),
		UploadPath: getEnv("UPLOAD_PATH", "./uploads"),
	}
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
