package httpserver

import (
	"encoding/json"
	"main/internal/domain/news"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

func (h *Handler) GetAllNews(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, http.MethodGet)

	newsList, err := h.newsService.GetAllNews()
	if err != nil {
		http.Error(w, "Error fetching news "+err.Error(), http.StatusInternalServerError)
		return
	}

	jsonData, err := json.Marshal(newsList)
	if err != nil {
		http.Error(w, "Error marshaling news", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

func (h *Handler) GetNewsByID(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, http.MethodGet)

	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid news ID", http.StatusBadRequest)
		return
	}

	n, err := h.newsService.GetNewsByID(id)
	if err != nil {
		http.Error(w, "Error fetching news by ID", http.StatusInternalServerError)
		return
	}
	if n == nil {
		http.NotFound(w, r)
		return
	}

	jsonData, err := json.Marshal(n)
	if err != nil {
		http.Error(w, "Error marshaling news", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

func (h *Handler) CreateNews(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, http.MethodPost)

	var newNews news.News // предполагаем, что структура news.News описывает поля новости
	if err := json.NewDecoder(r.Body).Decode(&newNews); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	err := h.newsService.CreateNews(newNews)
	if err != nil {
		http.Error(w, "Error creating news", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(`{"message":"news created"}`))
}

func (h *Handler) UpdateNews(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, http.MethodPut)

	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid news ID", http.StatusBadRequest)
		return
	}

	var updatedNews news.News
	if err := json.NewDecoder(r.Body).Decode(&updatedNews); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	updatedNews.ID = id

	err = h.newsService.UpdateNews(updatedNews)
	if err != nil {
		http.Error(w, "Error updating news", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message":"news updated"}`))
}

func (h *Handler) DeleteNews(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, http.MethodDelete)

	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid news ID", http.StatusBadRequest)
		return
	}

	err = h.newsService.DeleteNews(id)
	if err != nil {
		http.Error(w, "Error deleting news", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message":"news deleted"}`))
}
