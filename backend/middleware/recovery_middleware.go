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
		// Check if headers have already been written
		if c.Writer.Written() {
			// If headers are already written, we can't change the status code
			// Just log the error and return
			if err, ok := recovered.(string); ok {
				fmt.Printf("Panic recovered after headers written: %s\n", err)
				fmt.Printf("Stack trace: %s\n", debug.Stack())
			} else {
				fmt.Printf("Unknown panic recovered after headers written: %v\n", recovered)
				fmt.Printf("Stack trace: %s\n", debug.Stack())
			}
			return
		}

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
		// Check if headers have already been written
		if c.Writer.Written() {
			// If headers are already written, we can't change the status code
			// Just log the error and return
			if gin.Mode() == gin.DebugMode {
				if err, ok := recovered.(string); ok {
					fmt.Printf("Panic recovered after headers written: %s\n", err)
					fmt.Printf("Stack trace: %s\n", debug.Stack())
				} else {
					fmt.Printf("Unknown panic recovered after headers written: %v\n", recovered)
					fmt.Printf("Stack trace: %s\n", debug.Stack())
				}
			} else {
				if err, ok := recovered.(string); ok {
					fmt.Printf("Panic recovered after headers written: %s\n", err)
				} else {
					fmt.Printf("Unknown panic recovered after headers written: %v\n", recovered)
				}
			}
			return
		}

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
