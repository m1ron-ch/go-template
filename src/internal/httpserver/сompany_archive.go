package httpserver

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/golang-jwt/jwt/v4"
)

type CompanyRequest struct {
	LeakerID    int    `json:"leaked_id"`
	UserID      int    `json:"user_id"`
	CompanyName string `json:"company_name"`
	ArchiveName string `json:"archive_name"`
}

func (h *Handler) GetAllFiles(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, http.MethodGet)

	files, err := h.foldersService.GetAll()
	if err != nil {
		http.Error(w, "Error fetching archive "+err.Error(), http.StatusInternalServerError)
		return
	}

	jsonData, err := json.Marshal(files)
	if err != nil {
		http.Error(w, "Error marshaling news", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

func (h *Handler) GenerateCompanyArchive(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, http.MethodPost)

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

	var req CompanyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Error parsing JSON: "+err.Error(), http.StatusBadRequest)
		return
	}
	req.UserID = int(userFloat)
	if req.UserID == 0 || req.CompanyName == "" {
		http.Error(w, "user_id and company_name required", http.StatusBadRequest)
		return
	}

	folderName, nextNumber, err := h.foldersService.GetFreeFolder()
	if err != nil {
		http.Error(w, "Error getting next archive: "+err.Error(), http.StatusInternalServerError)
		return
	}

	lastID, err := h.foldersService.MarkFolderAsUsed(req.UserID, folderName, req.LeakerID, nextNumber)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	currLeaked, err := h.leakedService.GetByID(req.LeakerID)
	if err != nil {
		http.Error(w, "Error get leaked by id: "+err.Error(), http.StatusInternalServerError)
		return
	}
	currLeaked.Builder = lastID
	if err := h.leakedService.Update(currLeaked); err != nil {
		http.Error(w, "Error update leaked: "+err.Error(), http.StatusInternalServerError)
		return
	}

	remoteArchiveURL := fmt.Sprintf("%s/%s.zip", h.config.URL1, folderName)

	resp, err := http.Get(remoteArchiveURL)
	if err != nil {
		http.Error(w, "Error requesting remote archive: "+err.Error(), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		http.Error(w, "Remote server returned status "+resp.Status, http.StatusBadGateway)
		return
	}

	w.Header().Set("Content-Type", "application/zip")
	w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s.zip"`, folderName))
	if _, err := io.Copy(w, resp.Body); err != nil {
		fmt.Println("Error copying archive to client:", err)
	}
}

func (h *Handler) GenerateCompanyArchiveDecryptor(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, http.MethodPost)

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

	var req CompanyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Error parsing JSON: "+err.Error(), http.StatusBadRequest)
		return
	}
	req.UserID = int(userFloat)
	if req.UserID == 0 || req.ArchiveName == "" {
		http.Error(w, "user_id and archive_name required", http.StatusBadRequest)
		return
	}

	remoteArchiveURL := fmt.Sprintf("%s/%s.zip", h.config.URL2, req.ArchiveName)

	resp, err := http.Get(remoteArchiveURL)
	if err != nil {
		http.Error(w, "Error requesting remote archive: "+err.Error(), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		http.Error(w, "Remote server returned status "+resp.Status, http.StatusBadGateway)
		return
	}

	w.Header().Set("Content-Type", "application/zip")
	w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s.zip"`, req.ArchiveName))
	if _, err := io.Copy(w, resp.Body); err != nil {
		fmt.Println("Error copying archive to client:", err)
	}
}
