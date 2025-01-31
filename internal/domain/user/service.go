// internal/domain/user/service.go
package user

// Service содержит бизнес-логику работы с пользователями
type Service interface {
	GetAllUsers() ([]User, error)
	GetUserByID(id int64) (*User, error)
	// ...
}

type service struct {
	repo Repository
}

func NewUserService(r Repository) Service {
	return &service{repo: r}
}

func (s *service) GetAllUsers() ([]User, error) {
	return s.repo.GetAll()
}

func (s *service) GetUserByID(id int64) (*User, error) {
	return s.repo.GetByID(id)
}
