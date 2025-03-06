package httpserver

import (
	"encoding/json"
	"fmt"
	"main/internal/domain/user"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

func (h *Handler) GetUsers(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, "GET")

	users, err := h.userService.GetAllUsers()
	if err != nil {
		http.Error(w, "Error fetching users", http.StatusInternalServerError)
		return
	}

	jsonData, err := json.Marshal(users)
	if err != nil {
		http.Error(w, "Error marshaling users", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

func (h *Handler) GetUserByID(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, "GET")

	vars := mux.Vars(r)

	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid user id", http.StatusBadRequest)
		return
	}

	userData, err := h.userService.GetUserByID(id)
	if err != nil {
		http.Error(w, "Error fetching user", http.StatusInternalServerError)
		return
	}

	jsonData, err := json.Marshal(userData)
	if err != nil {
		http.Error(w, "Error marshaling user", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

func (h *Handler) RegisterUser(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, http.MethodPost)

	var req user.User
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	newUser, err := h.userService.Register(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusConflict)
		return
	}

	h.chatService.CreateChat(newUser.Login, int(newUser.ID), -1)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "User registered and logged in",
		"user":    newUser,
	})
}

// UpdateUser обрабатывает PUT запрос на обновление пользователя.
// ID пользователя извлекается из URL, а остальные поля — из JSON-тела запроса.
// Если поле Password пустое, то пароль обновляться не будет.
func (h *Handler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, http.MethodPut)

	// Извлекаем ID из URL
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid user id", http.StatusBadRequest)
		return
	}

	// Декодируем тело запроса
	var req user.User
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Принудительно устанавливаем ID из URL в структуру
	req.ID = id

	updatedUser, err := h.userService.Update(req)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error updating user: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "User updated successfully",
		"user":    updatedUser,
	})
}

// DeleteUser обрабатывает DELETE запрос на "мягкое удаление" пользователя.
// Пользователь не удаляется из базы, а его status_id обновляется на 2.
func (h *Handler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, http.MethodDelete)

	// Извлекаем ID из URL
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid user id", http.StatusBadRequest)
		return
	}

	// Получаем пользователя по ID
	userToDelete, err := h.userService.GetUserByID(id)
	if err != nil {
		http.Error(w, "Error fetching user", http.StatusInternalServerError)
		return
	}
	if userToDelete == nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	// Выполняем "мягкое" удаление (обновление status_id)
	deletedUser, err := h.userService.Delete(*userToDelete)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error deleting user: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "User deleted (soft delete)",
		"user":    deletedUser,
	})
}
