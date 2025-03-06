package httpserver

import (
	"encoding/json"
	"fmt"
	"main/internal/domain/editor"
	"net/http"
)

func (h *Handler) GetContactUs(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, http.MethodGet)

	editor, err := h.editorService.GetContactUs()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if editor == nil {
		http.NotFound(w, r)
		return
	}

	jsonData, err := json.Marshal(editor)
	if err != nil {
		http.Error(w, "Error marshaling news", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

func (h *Handler) UpdateContactUs(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, http.MethodPost)

	var editor editor.Editor
	if err := json.NewDecoder(r.Body).Decode(&editor); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	err := h.editorService.UpdateContactUs(editor)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		fmt.Println(err.Error())
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message":"news updated"}`))
}

func (h *Handler) GetOrderService(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, http.MethodGet)

	editor, err := h.editorService.GetOrderService()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if editor == nil {
		http.NotFound(w, r)
		return
	}

	jsonData, err := json.Marshal(editor)
	if err != nil {
		http.Error(w, "Error marshaling news", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

func (h *Handler) UpdateOrderService(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, http.MethodPost)

	var editor editor.Editor
	if err := json.NewDecoder(r.Body).Decode(&editor); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	err := h.editorService.UpdateOrderService(editor)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		fmt.Println(err.Error())
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message":"news updated"}`))
}

func (h *Handler) GetTermsConditions(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, http.MethodGet)

	editor, err := h.editorService.GetTermsConditions()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if editor == nil {
		http.NotFound(w, r)
		return
	}

	jsonData, err := json.Marshal(editor)
	if err != nil {
		http.Error(w, "Error marshaling news", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

func (h *Handler) UpdateTermsConditions(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, http.MethodPost)

	var editor editor.Editor
	if err := json.NewDecoder(r.Body).Decode(&editor); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	err := h.editorService.UpdateTermsConditions(editor)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		fmt.Println(err.Error())
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message":"news updated"}`))
}
