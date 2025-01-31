// internal/app/app.go
package app

import (
	"main/internal/config"
	"main/internal/domain/user"
	"main/internal/httpserver"
)

type Application struct {
	Config      *config.Config
	userService user.Service
}

func NewApplication(cfg *config.Config, userSrv user.Service) *Application {
	return &Application{
		Config:      cfg,
		userService: userSrv,
	}
}

func (app *Application) Run() error {
	h := httpserver.NewHandler(app.userService, app.Config)

	router := h.InitRoutes()

	if err := httpserver.Start(router, app.Config.ServerConfig); err != nil {
		return err
	}
	return nil
}
