package httpserver

import (
	"encoding/json"
	"net/http"
)

func (h *Handler) Blog(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, http.MethodPost)

	type Blog struct {
		LeakedID int `json:"leaked_id"`
	}

	var blog Blog
	if err := json.NewDecoder(r.Body).Decode(&blog); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	currLeaked, err := h.leakedService.GetByID(blog.LeakedID)
	if err != nil {
		http.Error(w, "Error get leaked by id "+err.Error(), http.StatusBadRequest)
		return
	}

	currLeaked.Publish = 1
	err = h.leakedService.Update(currLeaked)
	if err != nil {
		http.Error(w, "Error update leaked by id "+err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message":"news updated"}`))
}
