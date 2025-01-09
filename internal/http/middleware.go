package http

import (
	"context"
	"main/internal/token"
	"net/http"
	"strings"
)

type contextKey string

const CtxUserIDKey contextKey = "userID"

// AuthMiddleware – middleware, которое валидирует Access-токен
func AuthMiddleware(accessService *token.AccessTokenService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				http.Error(w, "No Authorization header", http.StatusUnauthorized)
				return
			}

			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || parts[0] != "Bearer" {
				http.Error(w, "Invalid Authorization header format", http.StatusUnauthorized)
				return
			}

			tokenString := parts[1]
			claims, err := accessService.Parse(tokenString)
			if err != nil {
				http.Error(w, "Invalid token: "+err.Error(), http.StatusUnauthorized)
				return
			}

			// Пишем userID (в нашем случае это username) в контекст
			ctx := context.WithValue(r.Context(), CtxUserIDKey, claims.UserID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
