package httpserver

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

type loginRequest struct {
	Login    string `json:"login"`
	Password string `json:"password"`
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, http.MethodPost)

	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	user, err := h.userService.Authenticate(req.Login, req.Password)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	if user.StatusID > 1 {
		http.Error(w, "Unauthorized. User account Blocked", http.StatusUnauthorized)
		return
	}

	claims := jwt.MapClaims{
		"user_id": user.ID,
		"login":   user.Login,
		"role_id": user.RoleID,
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Подпись (секрет берем из h.config, например h.config.JWTSecret)
	tokenString, err := token.SignedString([]byte(h.config.JWTSecret))
	if err != nil {
		http.Error(w, "Could not sign token", http.StatusInternalServerError)
		return
	}

	fmt.Println(tokenString)

	// Устанавливаем cookie с jwt
	// HttpOnly (чтобы нельзя было прочитать из JS),
	// Secure (если HTTPS), SameSite, и т.д. - по необходимости
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    tokenString,
		Expires:  time.Now().Add(24 * time.Hour),
		HttpOnly: true,
		Secure:   false, // true, если используете HTTPS
		Path:     "/",
		// SameSite: http.SameSiteStrictMode, // или None/Lax, на ваше усмотрение
	})

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(fmt.Sprintf(`{"token":%s, "message":"ok"}`, tokenString)))
}
