package app

import (
	"fmt"
	"log"
	"main/internal/config"
	"main/internal/database"
	"main/internal/httpserver"
	"main/internal/logger"
	"os"

	"go.uber.org/zap/zapcore"
)

type Application struct {
	Config *config.Config
	Logger logger.Logger
	DB     database.Database
}

func NewApplication() *Application {
	return &Application{}
}

func (app *Application) Run(configFile *string) error {
	cfg, err := config.LoadConfig(*configFile)
	if err != nil {
		fmt.Fprintf(os.Stderr, "config error: %s\n", err)
		os.Exit(1)
	}

	var zapLevel zapcore.Level
	switch cfg.LoggerConfig.Level {
	case "debug":
		zapLevel = zapcore.DebugLevel
	case "info":
		zapLevel = zapcore.InfoLevel
	case "warn":
		zapLevel = zapcore.WarnLevel
	case "error":
		zapLevel = zapcore.ErrorLevel
	default:
		zapLevel = zapcore.InfoLevel
	}

	logg, err := logger.NewLoggerWithRotation(
		cfg.LoggerConfig.FilePath,
		cfg.LoggerConfig.MaxSizeMB,
		cfg.LoggerConfig.MaxBackups,
		cfg.LoggerConfig.MaxAgeDays,
		cfg.LoggerConfig.Compress,
		zapLevel,
	)
	if err != nil {
		fmt.Fprintf(os.Stderr, "logger init error: %s\n", err)
		os.Exit(1)
	}

	defer logg.Sync()

	db, err := database.New(cfg.DBConfig)
	if err != nil {
		log.Panic("database init error", "error", err)
	}
	defer db.Close()

	h := httpserver.NewHandler(app.DB, app.Config)
	router := h.InitRoutes()

	httpserver.Start(router, cfg.ServerConfig)
	return nil

	// if err := server.Start(); err != nil {
	// 	log.Panic("server failed to start", "error", err)
	// }

	// return server.Start()
}