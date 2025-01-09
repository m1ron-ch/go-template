package httpserver

import (
	"main/internal/config"
	"main/internal/database"

	"github.com/gorilla/mux"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func NewHandler(db database.Database, cfg *config.Config) *Handler {
	return &Handler{
		DB:     db,
		Config: cfg,
	}
}

func (h *Handler) InitRoutes() *mux.Router {
	router := mux.NewRouter()

	// assetsDir := http.Dir("../ui/dist/assets")
	// router.PathPrefix("/assets/").Handler(http.StripPrefix("/assets/", http.FileServer(assetsDir)))

	// router.PathPrefix("/").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
	// 	http.ServeFile(w, r, filepath.Join("../ui/dist", "index.html"))
	// })

	router.Handle("/metrics", promhttp.Handler())

	return router
}
