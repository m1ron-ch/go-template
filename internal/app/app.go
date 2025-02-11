// internal/app/app.go
package app

import (
	"main/internal/config"
	"main/internal/domain/chat"
	"main/internal/domain/editor"
	"main/internal/domain/leaked"
	"main/internal/domain/news"
	usedfolders "main/internal/domain/used_folders"
	"main/internal/domain/user"
	"main/internal/httpserver"
	"main/internal/httpserver/manager"
)

type Application struct {
	ChatManager    *manager.ChatManager
	Config         *config.Config
	leakedService  leaked.Service
	foldersService usedfolders.FoldersService
	editorService  editor.Service
	userService    user.Service
	newsService    news.Service
	chatService    chat.Service
}

func NewApplication(cfg *config.Config, userSrv user.Service, newsSrv news.Service, chatSrv chat.Service, editorSrv editor.Service,
	foldersSrv usedfolders.FoldersService, leakedSrv leaked.Service, chatManager *manager.ChatManager) *Application {
	return &Application{
		ChatManager:    chatManager,
		Config:         cfg,
		leakedService:  leakedSrv,
		foldersService: foldersSrv,
		editorService:  editorSrv,
		userService:    userSrv,
		newsService:    newsSrv,
		chatService:    chatSrv,
	}
}

func (app *Application) Run() error {
	h := httpserver.NewHandler(app.userService, app.newsService, app.chatService, app.editorService, app.leakedService, app.foldersService, app.Config, app.ChatManager)
	h.ChatManager = app.ChatManager

	router := h.InitRoutes()

	if err := httpserver.Start(router, app.Config.ServerConfig); err != nil {
		return err
	}
	return nil
}
