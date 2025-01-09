package http

import (
	"encoding/json"
	"main/internal/usecase"
	"net/http"
)

// RegisterHandler – хендлер регистрации
func RegisterHandler(authUC *usecase.AuthUseCase) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Username string `json:"username"`
			Password string `json:"password"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid input", http.StatusBadRequest)
			return
		}
		// Упрощённо: считаем passwordHash == password (в реале нужно хэшировать)
		access, refresh, err := authUC.RegisterUser(req.Username, req.Password)
		if err != nil {
			http.Error(w, err.Error(), http.StatusConflict)
			return
		}

		json.NewEncoder(w).Encode(map[string]string{
			"access_token":  access,
			"refresh_token": refresh,
		})
	}
}

// LoginHandler – хендлер логина
func LoginHandler(authUC *usecase.AuthUseCase) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Username string `json:"username"`
			Password string `json:"password"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid input", http.StatusBadRequest)
			return
		}
		access, refresh, err := authUC.LoginUser(req.Username, req.Password)
		if err != nil {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}
		json.NewEncoder(w).Encode(map[string]string{
			"access_token":  access,
			"refresh_token": refresh,
		})
	}
}

// RefreshHandler – хендлер обновления токенов
func RefreshHandler(authUC *usecase.AuthUseCase) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			RefreshToken string `json:"refresh_token"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid input", http.StatusBadRequest)
			return
		}
		newAccess, newRefresh, err := authUC.RefreshTokens(req.RefreshToken)
		if err != nil {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}
		json.NewEncoder(w).Encode(map[string]string{
			"access_token":  newAccess,
			"refresh_token": newRefresh,
		})
	}
}

// ProfileHandler – пример защищённого ресурса
func ProfileHandler(userUC *usecase.UserUseCase) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// userID мы подставляем в контекст в middleware
		userID := r.Context().Value(CtxUserIDKey).(string)
		// Допустим, userID == username (упрощение)
		user, err := userUC.GetUserByUsername(userID)
		if err != nil {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		// Вернём username и id
		json.NewEncoder(w).Encode(map[string]interface{}{
			"id":       user.ID,
			"username": user.Username,
		})
	}
}
