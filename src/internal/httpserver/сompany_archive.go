package httpserver

import (
	"archive/zip"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/golang-jwt/jwt/v4"
	// ...
)

type CompanyRequest struct {
	LeakerID    int    `json:"leaked_id"`
	UserID      int    `json:"user_id"`
	CompanyName string `json:"company_name"`
}

func (h *Handler) GetAllFiles(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, http.MethodGet)

	files, err := h.foldersService.GetAll()
	if err != nil {
		http.Error(w, "Error fetching news "+err.Error(), http.StatusInternalServerError)
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

// Пример handler:
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

	// 1) Узнаём следующий свободный архив
	folderName, nextNumber, err := h.foldersService.GetFreeFolder()
	if err != nil {
		http.Error(w, "Error getting next archive: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 2) Сохраняем, что этот архив (archive_XXX) занял такой-то юзер
	lastID, err := h.foldersService.MarkFolderAsUsed(req.UserID, folderName, req.LeakerID, nextNumber)
	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 3) Обновляем leak (ваша логика)
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

	// 4) Теперь формируем ссылку на внешний сервер
	//    Допустим, "archive_101.zip" физически лежит по URL: https://ip:port/archive_101.zip
	remoteArchiveURL := fmt.Sprintf("%s/%s.zip", h.config.URL1, folderName)

	// Делаем запрос к тому серверу
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

	// 5) Проксируем клиенту
	w.Header().Set("Content-Type", "application/zip")
	w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s.zip"`, req.CompanyName))
	if _, err := io.Copy(w, resp.Body); err != nil {
		// Ошибка при копировании (зачастую уже часть ответа ушла)
		fmt.Println("Error copying archive to client:", err)
	}
}

// createZipFromFolder - вспомогательная функция для архивирования
func createZipFromFolder(srcDir string) (string, error) {
	zipPath := filepath.Join(os.TempDir(), fmt.Sprintf("archive_%d.zip", time.Now().UnixNano()))
	zipFile, err := os.Create(zipPath)
	if err != nil {
		return "", err
	}
	defer zipFile.Close()

	zipWriter := zip.NewWriter(zipFile)
	defer zipWriter.Close()

	err = filepath.Walk(srcDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		// Пропускаем корневую папку (srcDir), но добавляем вложенные
		if path == srcDir {
			return nil
		}

		relPath, err := filepath.Rel(srcDir, path)
		if err != nil {
			return err
		}

		header, err := zip.FileInfoHeader(info)
		if err != nil {
			return err
		}
		header.Name = relPath
		if info.IsDir() {
			header.Name += "/"
		} else {
			header.Method = zip.Deflate
		}
		writer, err := zipWriter.CreateHeader(header)
		if err != nil {
			return err
		}

		// Если файл, копируем его содержимое
		if !info.IsDir() {
			f, err := os.Open(path)
			if err != nil {
				return err
			}
			defer f.Close()

			if _, err := io.Copy(writer, f); err != nil {
				return err
			}
		}
		return nil
	})

	if err != nil {
		return "", err
	}

	return zipPath, nil
}
