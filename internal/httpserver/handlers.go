package httpserver

import (
	"main/internal/config"
	"main/internal/database"
	"main/internal/logger"
)

type Handler struct {
	Config *config.Config
	Logger logger.Logger
	DB     database.Database
}
