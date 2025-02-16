package main

import (
	"log"
	"main/internal/app"
	"main/internal/config"
	"main/internal/domain/chat"
	"main/internal/domain/editor"
	"main/internal/domain/leaked"
	"main/internal/domain/news"
	usedfolders "main/internal/domain/used_folders"
	"main/internal/domain/user"
	"main/internal/gorutine"
	"main/internal/httpserver/manager"
	"main/internal/repository/mysql"
)

func main() {
	cm := manager.NewChatManager()

	go cm.Run()

	// 1. Загружаем конфигурацию
	cfg, err := config.MustLoad("config")
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// 2. Подключаемся к базе данных
	db, err := mysql.New(cfg.DBConfig)
	if err != nil {
		log.Fatalf("Failed to connect to DB: %v", err)
	}
	defer db.Close()

	// 3. Инициализируем репозиторий
	userRepo := mysql.NewUserRepository(db.DB)
	userService := user.NewUserService(userRepo)

	// 4. Инициализируем сервис (бизнес-логику)
	newsRepo := mysql.NewNewsRepository(db.DB)
	newsService := news.NewNewsService(newsRepo)

	chatRepo := mysql.NewChatRepository(db.DB)
	chatService := chat.NewService(chatRepo)

	editorRepo := mysql.NewEditorRepository(db.DB)
	editorService := editor.NewEditorService(editorRepo)

	folderRepo := mysql.NewUsedFoldersRepoPG(db.DB)
	folderService := usedfolders.NewFoldersService(folderRepo)

	leakedRepo := mysql.NewLeakedRepository(db.DB)
	leakedService := leaked.NewLeakedService(leakedRepo)

	gorutine.StartNewsPublisher(leakedService)

	// 5. Создаём наше "приложение" (Application)
	application := app.NewApplication(cfg, userService, newsService, chatService, editorService, folderService, leakedService, cm)

	// 6. Запускаем
	if err := application.Run(); err != nil {
		log.Fatalf("Error running application: %v", err)
	}
}
