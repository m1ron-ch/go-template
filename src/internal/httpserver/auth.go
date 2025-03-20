package httpserver

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/golang-jwt/jwt/v4"
)

func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("token")
	if err != nil {
		http.Error(w, "No token cookie", http.StatusUnauthorized)
		return
	}

	tokenString := cookie.Value
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(h.config.JWTSecret), nil
	})
	if err != nil || !token.Valid {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	fmt.Println(tokenString)

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		http.Error(w, "Invalid claims", http.StatusUnauthorized)
		return
	}

	login, _ := claims["login"].(string)

	userFloat, ok := claims["user_id"].(float64)
	if !ok {
		http.Error(w, "Invalid user_id in token", http.StatusUnauthorized)
		return
	}

	userID := int(userFloat)

	roleFloat, ok := claims["role_id"].(float64)
	if !ok {
		http.Error(w, "Invalid role_id in token", http.StatusUnauthorized)
		return
	}

	roleID := int(roleFloat)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"user_id": userID,
		"login":   login,
		"role_id": roleID,
	})
}
