package middleware

import (
	"net/http"

	"github.com/golang-jwt/jwt/v4"
)

func JwtAuthMiddleware(secret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Достаем cookie "token"
			cookie, err := r.Cookie("token")
			if err != nil {
				http.Error(w, "No token cookie", http.StatusUnauthorized)
				return
			}

			tokenString := cookie.Value
			// Парсим токен
			token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
				// Проверяем метод подписи
				if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, http.ErrNoCookie
				}
				return []byte(secret), nil
			})
			if err != nil || !token.Valid {
				http.Error(w, "Invalid token", http.StatusUnauthorized)
				return
			}

			// Пробрасываем дальше
			next.ServeHTTP(w, r)
		})
	}
}
