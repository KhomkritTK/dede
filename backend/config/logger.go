package config

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
)

var (
	Logger *log.Logger
)

func InitLogger() {
	Logger = log.New(os.Stdout, "[eservice] ", log.LstdFlags|log.Lshortfile)
}

func SetGinLogger() {
	if gin.Mode() == gin.ReleaseMode {
		gin.DefaultWriter = os.Stdout
	} else {
		gin.DefaultWriter = os.Stdout
	}
}
