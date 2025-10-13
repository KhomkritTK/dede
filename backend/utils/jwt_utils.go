package utils

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// JWTClaims represents the claims in a JWT token
type JWTClaims struct {
	UserID uint   `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// GenerateJWT generates a new JWT token
func GenerateJWT(userID uint, email, role, secretKey string, expiry time.Duration) (string, error) {
	claims := JWTClaims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiry)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "eservice-backend",
			Subject:   "user-auth",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secretKey))
}

// ValidateJWT validates a JWT token and returns the claims
func ValidateJWT(tokenString, secretKey string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Validate signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}
		return []byte(secretKey), nil
	})

	if err != nil {
		return nil, err
	}

	// Check if token is valid
	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	// Extract claims
	claims, ok := token.Claims.(*JWTClaims)
	if !ok {
		return nil, errors.New("invalid token claims")
	}

	// Check if token is expired
	if time.Now().After(claims.ExpiresAt.Time) {
		return nil, errors.New("token expired")
	}

	return claims, nil
}

// RefreshJWT generates a new JWT token with extended expiry
func RefreshJWT(tokenString, secretKey string, expiry time.Duration) (string, error) {
	claims, err := ValidateJWT(tokenString, secretKey)
	if err != nil {
		return "", err
	}

	// Generate new token with same claims but new expiry
	return GenerateJWT(claims.UserID, claims.Email, claims.Role, secretKey, expiry)
}

// ExtractTokenFromHeader extracts JWT token from Authorization header
func ExtractTokenFromHeader(authHeader string) (string, error) {
	if authHeader == "" {
		return "", errors.New("authorization header is required")
	}

	// Check if the token has the Bearer prefix
	if len(authHeader) < 7 || authHeader[:7] != "Bearer " {
		return "", errors.New("invalid authorization header format")
	}

	// Extract the token
	tokenString := authHeader[7:]
	if tokenString == "" {
		return "", errors.New("token is required")
	}

	return tokenString, nil
}

// GenerateTokenPair generates access and refresh tokens
func GenerateTokenPair(userID uint, email, role, secretKey string) (accessToken, refreshToken string, err error) {
	// Generate access token (short-lived)
	accessToken, err = GenerateJWT(userID, email, role, secretKey, time.Hour*24)
	if err != nil {
		return "", "", err
	}

	// Generate refresh token (long-lived)
	refreshToken, err = GenerateJWT(userID, email, role, secretKey, time.Hour*24*30) // 30 days
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}
