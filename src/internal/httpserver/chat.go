package httpserver

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/golang-jwt/jwt/v4"
	"github.com/gorilla/mux"
)

// ------------------ ЧАТЫ ------------------

// GetAllChats - Получение всех чатов
func (h *Handler) GetAllChats(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, http.MethodGet)

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

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		http.Error(w, "Invalid claims", http.StatusUnauthorized)
		return
	}

	userFloat, ok := claims["user_id"].(float64)
	if !ok {
		http.Error(w, "Invalid user_id in token", http.StatusUnauthorized)
		return
	}

	user, err := h.userService.GetUserByID(int64(userFloat))
	if err != nil {
		http.Error(w, "Error fetching user "+err.Error(), http.StatusInternalServerError)
		return
	}

	chats, err := h.chatService.GetAllChats(user)
	if err != nil {
		http.Error(w, "Error fetching chats "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(chats)
}

func (h *Handler) GetAllChatsByLeakedID(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, http.MethodGet)

	vars := mux.Vars(r)
	leakedID, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid chat ID", http.StatusBadRequest)
		return
	}

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

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		http.Error(w, "Invalid claims", http.StatusUnauthorized)
		return
	}

	userFloat, ok := claims["user_id"].(float64)
	if !ok {
		http.Error(w, "Invalid user_id in token", http.StatusUnauthorized)
		return
	}

	user, err := h.userService.GetUserByID(int64(userFloat))
	if err != nil {
		http.Error(w, "Error fetching user "+err.Error(), http.StatusInternalServerError)
		return
	}

	chat, err := h.chatService.GetAllChatsByLeakedID(user, int(leakedID))
	if err != nil {
		http.Error(w, "Chat not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(chat)
}

// GetChatByID - Получение чата по ID
func (h *Handler) GetChatByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	chatID, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid chat ID", http.StatusBadRequest)
		return
	}

	chat, err := h.chatService.GetChatByID(chatID)
	if err != nil {
		http.Error(w, "Chat not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(chat)
}

// CreateChat - Создание нового чата
func (h *Handler) CreateChat(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name    string `json:"name"`
		OwnerID int    `json:"owner_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	chatID, err := h.chatService.CreateChat(req.Name, req.OwnerID, -1)
	if err != nil {
		http.Error(w, "Error creating chat", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]int64{"chat_id": chatID})
}

// UpdateChat - Обновление названия чата
func (h *Handler) UpdateChat(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	chatID, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid chat ID", http.StatusBadRequest)
		return
	}

	var req struct {
		Name string `json:"name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	err = h.chatService.UpdateChat(chatID, req.Name)
	if err != nil {
		http.Error(w, "Error updating chat", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// DeleteChat - Удаление чата
func (h *Handler) DeleteChat(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	chatID, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid chat ID", http.StatusBadRequest)
		return
	}

	err = h.chatService.DeleteChat(chatID)
	if err != nil {
		http.Error(w, "Error deleting chat", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
