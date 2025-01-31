package main

import (
	"log"
	"main/internal/app"
	"main/internal/config"
	"main/internal/domain/user"
	"main/internal/repository/mysql"
)

func main() {
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

	// 4. Инициализируем сервис (бизнес-логику)
	userService := user.NewUserService(userRepo)

	// 5. Создаём наше "приложение" (Application)
	application := app.NewApplication(cfg, userService)

	// 6. Запускаем
	if err := application.Run(); err != nil {
		log.Fatalf("Error running application: %v", err)
	}
}
