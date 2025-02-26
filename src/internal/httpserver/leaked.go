package httpserver

import (
	"encoding/json"
	"fmt"
	"main/internal/domain/leaked"
	"net/http"
	"strconv"

	"github.com/golang-jwt/jwt/v4"
	"github.com/gorilla/mux"
)

// ...

func (h *Handler) GetAllLeakeds(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, http.MethodGet)

	leakedList, err := h.leakedService.GetAll()
	if err != nil {
		http.Error(w, "Error fetching leaked data: "+err.Error(), http.StatusInternalServerError)
		return
	}

	jsonData, err := json.Marshal(leakedList)
	if err != nil {
		http.Error(w, "Error marshaling leaked data", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

func (h *Handler) GetCountNotAccepted(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, http.MethodGet)

	notAcceptedCount, err := h.leakedService.GetCountNotAccepted()
	if err != nil {
		http.Error(w, "Error fetching leaked data: "+err.Error(), http.StatusInternalServerError)
		return
	}

	response := struct {
		Count int `json:"count"`
	}{
		Count: notAcceptedCount,
	}

	// Кодируем JSON-ответ
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Error encoding JSON", http.StatusInternalServerError)
	}
}

func (h *Handler) GetAllCampaing(w http.ResponseWriter, r *http.Request) {
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
	userID := int(userFloat)

	leakedList, err := h.leakedService.GetAllCapmaingByUserID(userID)
	if err != nil {
		http.Error(w, "Error fetching leaked data: "+err.Error(), http.StatusInternalServerError)
		return
	}

	jsonData, err := json.Marshal(leakedList)
	if err != nil {
		http.Error(w, "Error marshaling leaked data", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

func (h *Handler) CreateCampaing(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, http.MethodPost)

	// Parse JSON from request
	var newLeak leaked.Leaked
	if err := json.NewDecoder(r.Body).Decode(&newLeak); err != nil {
		http.Error(w, "Invalid JSON: "+err.Error(), http.StatusBadRequest)
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
	userID := int(userFloat)

	user, _ := h.userService.GetUserByID(int64(userID))
	newLeak.User = *user

	// Optionally set creation time if your domain logic needs it:
	// newLeak.CreateAt = time.Now()  // or other default fields

	// Call service
	createdID, err := h.leakedService.Create(&newLeak)
	if err != nil {
		http.Error(w, "Error creating leaked: "+err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Println(newLeak.CompanyName, int(newLeak.User.ID), newLeak.ID)

	_, err = h.chatService.CreateChat(newLeak.CompanyName, int(newLeak.User.ID), createdID)
	if err != nil {
		http.Error(w, "Error creating leaked chat: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// You can return just the ID, or fetch the newly-created record, or echo what was created.
	resp := map[string]interface{}{
		"id":      createdID,
		"message": "Leaked created successfully",
	}
	respData, err := json.Marshal(resp)
	if err != nil {
		http.Error(w, "Error marshaling response", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	w.Write(respData)
}

func (h *Handler) GetAllActiveLeakeds(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, http.MethodGet)

	leakedList, err := h.leakedService.GetAllActive()
	if err != nil {
		http.Error(w, "Error fetching leaked data: "+err.Error(), http.StatusInternalServerError)
		return
	}

	jsonData, err := json.Marshal(leakedList)
	if err != nil {
		http.Error(w, "Error marshaling leaked data", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

func (h *Handler) GetAllUnACtiveLeakeds(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, http.MethodGet)

	leakedList, err := h.leakedService.GetAllUnActive()
	if err != nil {
		http.Error(w, "Error fetching leaked data: "+err.Error(), http.StatusInternalServerError)
		return
	}

	jsonData, err := json.Marshal(leakedList)
	if err != nil {
		http.Error(w, "Error marshaling leaked data", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

func (h *Handler) GetLeakedsByID(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, http.MethodGet)

	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid leaked ID", http.StatusBadRequest)
		return
	}

	leak, err := h.leakedService.GetByID(int(id))
	if err != nil {
		http.Error(w, "Error fetching leaked by ID: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if leak == nil {
		http.NotFound(w, r)
		return
	}

	jsonData, err := json.Marshal(leak)
	if err != nil {
		http.Error(w, "Error marshaling leaked data", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

func (h *Handler) LeakedAccepted(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, http.MethodPut)

	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid leaked ID", http.StatusBadRequest)
		return
	}

	type Leaked struct {
		LeakedID int `json:"leaked_id"`
	}

	var currLeaked Leaked
	if err := json.NewDecoder(r.Body).Decode(&currLeaked); err != nil {
		http.Error(w, "Invalid JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	if currLeaked.LeakedID != id {
		http.Error(w, "Error leaked_id != path_id", http.StatusInternalServerError)
		return
	}

	if err := h.leakedService.Accepted(currLeaked.LeakedID); err != nil {
		http.Error(w, "Error accept leaked: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
}

func (h *Handler) LeakedReject(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, http.MethodPut)

	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid leaked ID", http.StatusBadRequest)
		return
	}

	type Leaked struct {
		LeakedID int `json:"leaked_id"`
	}

	var currLeaked Leaked
	if err := json.NewDecoder(r.Body).Decode(&currLeaked); err != nil {
		http.Error(w, "Invalid JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	if currLeaked.LeakedID != id {
		http.Error(w, "Error leaked_id != path_id: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if err := h.leakedService.Reject(currLeaked.LeakedID); err != nil {
		http.Error(w, "Error accept leaked: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
}

func (h *Handler) CreateLeaked(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, http.MethodPost)

	// Parse JSON from request
	var newLeak leaked.Leaked
	if err := json.NewDecoder(r.Body).Decode(&newLeak); err != nil {
		http.Error(w, "Invalid JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Optionally set creation time if your domain logic needs it:
	// newLeak.CreateAt = time.Now()  // or other default fields

	// Call service
	createdID, err := h.leakedService.Create(&newLeak)
	if err != nil {
		http.Error(w, "Error creating leaked: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// You can return just the ID, or fetch the newly-created record, or echo what was created.
	resp := map[string]interface{}{
		"id":      createdID,
		"message": "Leaked created successfully",
	}
	respData, err := json.Marshal(resp)
	if err != nil {
		http.Error(w, "Error marshaling response", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	w.Write(respData)
}

func (h *Handler) UpdateLeaked(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, http.MethodPut)

	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid leaked ID", http.StatusBadRequest)
		return
	}

	// Parse JSON
	var updatedLeak leaked.Leaked
	if err := json.NewDecoder(r.Body).Decode(&updatedLeak); err != nil {
		http.Error(w, "Invalid JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Overwrite the ID to ensure we update the correct record
	updatedLeak.ID = int(id)

	// Call service
	if err := h.leakedService.Update(&updatedLeak); err != nil {
		http.Error(w, "Error updating leaked: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "Leaked updated successfully"}`))
}

func (h *Handler) DeleteLeaked(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, http.MethodDelete)

	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, "Invalid leaked ID", http.StatusBadRequest)
		return
	}

	if err := h.leakedService.Delete(int(id)); err != nil {
		http.Error(w, "Error deleting leaked: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "Leaked deleted successfully"}`))
}
