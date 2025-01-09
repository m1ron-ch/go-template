package usecase

import (
	"errors"
	"main/internal/entity"
)

type UserRepository interface {
	CreateUser(u *entity.User) (int64, error)
	GetByUsername(username string) (*entity.User, error)
}

type UserUseCase struct {
	userRepo UserRepository
}

func NewUserUseCase(repo UserRepository) *UserUseCase {
	return &UserUseCase{userRepo: repo}
}

// Register регистрирует нового пользователя.
// Здесь же (упрощённо) «хэшируем» пароль, проверяем уникальность, и т.д.
func (uc *UserUseCase) Register(username, passwordHash string) (int64, error) {
	// Проверим, нет ли уже пользователя с таким именем
	existing, _ := uc.userRepo.GetByUsername(username)
	if existing != nil {
		return 0, errors.New("username already taken")
	}

	user := &entity.User{
		Username:     username,
		PasswordHash: passwordHash,
	}

	return uc.userRepo.CreateUser(user)
}

// GetUserByUsername возвращает пользователя (или ошибку, если не найден).
func (uc *UserUseCase) GetUserByUsername(username string) (*entity.User, error) {
	return uc.userRepo.GetByUsername(username)
}
