// internal/httpserver/handler.go
package httpserver

import (
	"fmt"
	"main/internal/config"
	"main/internal/domain/user"
	"main/internal/middleware"
	"net/http"
	"path/filepath"
	"runtime"
	"strconv"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

type Handler struct {
	userService user.Service
	config      *config.Config
}

// Конструктор нашего Handler
func NewHandler(userSrv user.Service, cfg *config.Config) *Handler {
	return &Handler{
		userService: userSrv,
		config:      cfg,
	}
}

func (h *Handler) InitRoutes() *mux.Router {
	router := mux.NewRouter()

	api := router.PathPrefix("/api").Subrouter()
	api.HandleFunc("/users", h.GetUsers).Methods(http.MethodGet)
	api.HandleFunc("/users/{id}", h.GetUserByID).Methods(http.MethodGet)

	_, b, _, _ := runtime.Caller(0)
	basePath := filepath.Dir(filepath.Dir(filepath.Dir(b)))
	uiPath := filepath.Join(basePath, "ui")
	assetsPath := filepath.Join(uiPath, "dist", "assets")

	assetsDir := http.Dir(assetsPath)
	router.PathPrefix("/assets/").
		Handler(http.StripPrefix("/assets/", http.FileServer(assetsDir)))

	// router.Handle("/metrics", promhttp.Handler())

	fmt.Println(filepath.Join(uiPath, "dist", "assets"))
	fmt.Println(filepath.Join(uiPath, "index.html"))

	router.PathPrefix("/").
		HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			http.ServeFile(w, r, filepath.Join(uiPath, "dist", "index.html"))
		})

	router.Use(handlers.RecoveryHandler())
	router.Use(middleware.TrustProxy(middleware.PrivateRanges()))
	router.Use(middleware.Logger())

	return router
}

func (h *Handler) GetUsers(w http.ResponseWriter, r *http.Request) {
	_, err := h.userService.GetAllUsers()
	if err != nil {
		http.Error(w, "Error fetching users", http.StatusInternalServerError)
		return
	}
}

func (h *Handler) GetUserByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)

	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		return
	}

	_, err = h.userService.GetUserByID(id)
	if err != nil {
		http.Error(w, "Error fetching user", http.StatusInternalServerError)
		return
	}
}
