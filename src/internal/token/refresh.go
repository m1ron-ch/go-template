package token

import (
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type RefreshClaims struct {
	UserID string `json:"user_id"`
	jwt.RegisteredClaims
}

type RefreshTokenService struct {
	secretKey []byte
	store     RefreshTokenStore
}

func NewRefreshTokenService(secretKey []byte, store RefreshTokenStore) *RefreshTokenService {
	return &RefreshTokenService{secretKey: secretKey, store: store}
}

func (s *RefreshTokenService) Generate(userID string, ttlHours int) (string, error) {
	expiresAt := time.Now().Add(time.Duration(ttlHours) * time.Hour)
	claims := RefreshClaims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "my-app",
			Subject:   userID,
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(s.secretKey)
	if err != nil {
		return "", err
	}

	s.store.Save(tokenString, expiresAt)
	return tokenString, nil
}

func (s *RefreshTokenService) Parse(tokenString string) (*RefreshClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &RefreshClaims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("invalid signing method: %v", t.Header["alg"])
		}
		return s.secretKey, nil
	})
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(*RefreshClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid refresh token")
	}

	if !s.store.Exists(tokenString) {
		return nil, errors.New("refresh token revoked or not found in store")
	}

	return claims, nil
}

func (s *RefreshTokenService) Refresh(oldRefreshToken string, accessService *AccessTokenService, newAccessTTLMinutes, newRefreshTTLHours int) (string, string, error) {
	oldClaims, err := s.Parse(oldRefreshToken)
	if err != nil {
		return "", "", err
	}
	userID := oldClaims.UserID

	// Генерируем новый Access
	newAccess, err := accessService.Generate(userID, newAccessTTLMinutes)
	if err != nil {
		return "", "", err
	}

	// Генерируем новый Refresh
	newRefresh, err := s.Generate(userID, newRefreshTTLHours)
	if err != nil {
		return "", "", err
	}

	// Отзываем старый
	s.store.Delete(oldRefreshToken)

	return newAccess, newRefresh, nil
}

func (s *RefreshTokenService) Revoke(tokenString string) {
	s.store.Delete(tokenString)
}
