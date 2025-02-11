package httpserver

import (
	"encoding/json"
	"fmt"
	"io"
	"main/internal/domain/media"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/disintegration/imaging"
)

func (h *Handler) DisplayMedia(w http.ResponseWriter, r *http.Request) {
	h.SetCORSHeaders(w, http.MethodGet)

	_, b, _, _ := runtime.Caller(0)
	basePath := filepath.Dir(filepath.Dir(filepath.Dir(b)))
	mediaPath := "static/media/*"
	path := filepath.Join(basePath, mediaPath)

	files, err := filepath.Glob(path)
	if err != nil {
		fmt.Println(err.Error())
		http.Error(w, "Ошибка чтения файлов по пути: "+path, http.StatusInternalServerError)
		return
	}

	var mediaData []media.Media
	for _, file := range files {
		filename := filepath.Base(file)

		fileInfo, err := os.Stat(file)
		if err != nil {
			http.Error(w, "Ошибка получения данных файла", http.StatusInternalServerError)
			return
		}

		var fileType string
		ext := strings.ToLower(filepath.Ext(filename))
		switch ext {
		case ".jpg", ".jpeg", ".png", ".gif", ".webp":
			fileType = "image"
		case ".mp4", ".avi", ".mkv":
			fileType = "video"
		default:
			fileType = "file"
		}

		mediaData = append(mediaData, media.Media{
			Filename:   filename,
			UploadDate: fileInfo.ModTime(),
			Url:        fmt.Sprintf("/static/media/%s", filename),
			FullUrl:    fmt.Sprintf("h/static/media/%s", filename),
			Type:       fileType,
		})
	}

	sort.Slice(mediaData, func(i, j int) bool {
		return mediaData[i].UploadDate.After(mediaData[j].UploadDate)
	})

	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")

	var response map[string]interface{}

	if pageStr == "" && limitStr == "" {
		response = map[string]interface{}{
			"total": len(mediaData),
			"data":  mediaData,
		}
	} else {
		page, errPage := strconv.Atoi(pageStr)
		if errPage != nil || page <= 0 {
			page = 1
		}
		limit, errLimit := strconv.Atoi(limitStr)
		if errLimit != nil || limit <= 0 {
			limit = 10
		}

		start := (page - 1) * limit
		end := start + limit
		if start > len(mediaData) {
			start = len(mediaData)
		}
		if end > len(mediaData) {
			end = len(mediaData)
		}

		response = map[string]interface{}{
			"total": len(mediaData),
			"page":  page,
			"limit": limit,
			"data":  mediaData[start:end],
		}
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		http.Error(w, "Ошибка создания JSON", http.StatusInternalServerError)
	}
}

func (h *Handler) UploadMediaHandle(w http.ResponseWriter, r *http.Request) {
	// Set CORS headers for POST
	h.SetCORSHeaders(w, http.MethodPost)

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Limit the request body to 250 MB
	r.Body = http.MaxBytesReader(w, r.Body, 250<<20)

	if err := r.ParseMultipartForm(250 << 20); err != nil {
		http.Error(w, fmt.Sprintf("failed to parse form: %v", err), http.StatusBadRequest)
		return
	}

	// Expect files under the form key "file"
	files, ok := r.MultipartForm.File["file"]
	if !ok || len(files) == 0 {
		http.Error(w, "no files uploaded", http.StatusBadRequest)
		return
	}

	// Determine the base path and ensure the target directory exists
	_, b, _, _ := runtime.Caller(0)
	basePath := filepath.Dir(filepath.Dir(filepath.Dir(b)))
	mediaPath := filepath.Join(basePath, "static/media")
	if err := os.MkdirAll(mediaPath, os.ModePerm); err != nil {
		http.Error(w, fmt.Sprintf("error creating directory: %v", err), http.StatusInternalServerError)
		return
	}

	// Prepare a slice to store uploaded file info
	var uploadedFiles []map[string]interface{}

	// Process each file uploaded
	for _, fileHeader := range files {
		f, err := fileHeader.Open()
		if err != nil {
			// Skip this file on error
			continue
		}

		// Process the file in a separate block to ensure closure
		func(f multipart.File, fileHeader *multipart.FileHeader) {
			defer f.Close()

			// Get original filename and its extension
			originalFilename := fileHeader.Filename
			ext := filepath.Ext(originalFilename)
			// Optionally, prepend a unique prefix (timestamp) to avoid collisions
			baseName := strings.TrimSuffix(originalFilename, ext)
			currentTime := time.Now().Unix() // or time.Now().UnixNano()
			filename := fmt.Sprintf("%s_%d%s", baseName, currentTime, ext)

			// Now the full path is:
			fullPath := filepath.Join(mediaPath, filename)
			// filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), originalFilename)
			// fullPath := filepath.Join(mediaPath, filename)

			// Read the first 512 bytes for MIME type detection
			buffer := make([]byte, 512)
			n, err := f.Read(buffer)
			if err != nil {
				return
			}
			// Reset the file pointer to the beginning
			f.Seek(0, io.SeekStart)

			mimeType := http.DetectContentType(buffer[:n])
			validImage := false
			switch mimeType {
			case "image/jpeg":
				if strings.EqualFold(ext, ".jpg") || strings.EqualFold(ext, ".jpeg") {
					validImage = true
				}
			case "image/png":
				if strings.EqualFold(ext, ".png") {
					validImage = true
				}
			case "image/gif":
				if strings.EqualFold(ext, ".gif") {
					validImage = true
				}
			}

			// If the file is a valid image, process it using the imaging library
			if strings.HasPrefix(mimeType, "image/") && validImage {
				img, err := imaging.Decode(f)
				if err != nil {
					return
				}

				// Save the image with appropriate settings based on its extension
				if strings.EqualFold(ext, ".jpg") || strings.EqualFold(ext, ".jpeg") {
					err = imaging.Save(img, fullPath, imaging.JPEGQuality(80))
				} else if strings.EqualFold(ext, ".png") {
					err = imaging.Save(img, fullPath)
				} else if strings.EqualFold(ext, ".gif") {
					err = imaging.Save(img, fullPath)
				} else if strings.EqualFold(ext, ".webp") {
					err = imaging.Save(img, fullPath)
				}
				if err != nil {
					return
				}
			} else {
				// Otherwise, simply save the file as is
				dst, err := os.Create(fullPath)
				if err != nil {
					return
				}
				defer dst.Close()

				if _, err = io.Copy(dst, f); err != nil {
					return
				}
			}

			// Build the file URL from your server settings
			// serverAddr := h.config.ServerConfig.Address
			// serverPort := h.config.ServerConfig.Port
			fileURL := fmt.Sprintf("/static/media/%s", filename)

			// Append this file's details to the result slice
			uploadedFiles = append(uploadedFiles, map[string]interface{}{
				"filename": filename,
				"url":      fileURL,
			})
		}(f, fileHeader)
	}

	// Build and send the JSON response containing all uploaded file info
	response := map[string]interface{}{
		"success": 1,
		"files":   uploadedFiles,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, fmt.Sprintf("failed to encode JSON: %v", err), http.StatusInternalServerError)
		return
	}
}
