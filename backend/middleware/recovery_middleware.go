package middleware

import (
	"fmt"
	"net/http"
	"runtime/debug"

	"github.com/gin-gonic/gin"
)

// RecoveryMiddleware recovers from any panics and returns a 500 error
func RecoveryMiddleware() gin.HandlerFunc {
	return gin.CustomRecovery(func(c *gin.Context, recovered interface{}) {
		if err, ok := recovered.(string); ok {
			fmt.Printf("Panic recovered: %s\n", err)
			fmt.Printf("Stack trace: %s\n", debug.Stack())
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Internal server error",
				"message": "Something went wrong. Please try again later.",
			})
		} else {
			fmt.Printf("Unknown panic recovered: %v\n", recovered)
			fmt.Printf("Stack trace: %s\n", debug.Stack())
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Internal server error",
				"message": "Something went wrong. Please try again later.",
			})
		}
	})
}

// DetailedRecoveryMiddleware provides more detailed error information in development mode
func DetailedRecoveryMiddleware() gin.HandlerFunc {
	return gin.CustomRecovery(func(c *gin.Context, recovered interface{}) {
		if gin.Mode() == gin.DebugMode {
			// In debug mode, provide more detailed error information
			if err, ok := recovered.(string); ok {
				fmt.Printf("Panic recovered: %s\n", err)
				fmt.Printf("Stack trace: %s\n", debug.Stack())
				c.JSON(http.StatusInternalServerError, gin.H{
					"error":   "Internal server error",
					"message": err,
					"stack":   string(debug.Stack()),
				})
			} else {
				fmt.Printf("Unknown panic recovered: %v\n", recovered)
				fmt.Printf("Stack trace: %s\n", debug.Stack())
				c.JSON(http.StatusInternalServerError, gin.H{
					"error":   "Internal server error",
					"message": fmt.Sprintf("%v", recovered),
					"stack":   string(debug.Stack()),
				})
			}
		} else {
			// In production mode, provide minimal error information
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Internal server error",
				"message": "Something went wrong. Please try again later.",
			})
		}
	})
}
