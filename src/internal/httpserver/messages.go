package httpserver

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

func (h *Handler) GetAllMessagesByChat(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, http.MethodGet)

	vars := mux.Vars(r)
	chatID, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid chat ID", http.StatusBadRequest)
		return
	}

	msgs, err := h.chatService.GetAllMessagesByChat(chatID)
	if err != nil {
		http.Error(w, "Error fetching messages "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(msgs)
}

// CreateMessage - adds a new message
func (h *Handler) CreateMessage(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ChatID   int64  `json:"chat_id"`
		SenderID int64  `json:"sender_id"`
		Content  string `json:"content"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	msgID, err := h.chatService.CreateMessage(req.ChatID, req.SenderID, req.Content)
	if err != nil {
		http.Error(w, "Error creating message", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message_id": msgID,
	})
}

// EditMessage - updates content of a specific message
func (h *Handler) EditMessage(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	msgID, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid message ID", http.StatusBadRequest)
		return
	}
	var req struct {
		SenderID   int64  `json:"sender_id"`
		NewContent string `json:"content"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	err = h.chatService.EditMessage(msgID, req.SenderID, req.NewContent)
	if err != nil {
		http.Error(w, "Error editing message", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

// DeleteMessage - marks message as deleted
func (h *Handler) DeleteMessage(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	msgID, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid message ID", http.StatusBadRequest)
		return
	}
	var req struct {
		SenderID int64 `json:"sender_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	err = h.chatService.DeleteMessage(msgID, req.SenderID)
	if err != nil {
		http.Error(w, "Error deleting message", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}
