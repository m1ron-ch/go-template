// internal/domain/user/service.go
package user

// Service содержит бизнес-логику работы с пользователями
type Service interface {
	GetAllUsers() ([]User, error)
	GetUserByID(id int64) (*User, error)
	GetUserByLogin(login string) (*User, error)
	Authenticate(login, password string) (*User, error)
	Register(user User) (*User, error)
	Update(user User) (*User, error)
	Delete(user User) (*User, error)
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

func (s *service) GetUserByLogin(login string) (*User, error) {
	return s.repo.GetByLogin(login)
}

func (s *service) Authenticate(login, password string) (*User, error) {
	return s.repo.Authenticate(login, password)
}

func (s *service) Register(user User) (*User, error) {
	return s.repo.Register(user)
}

func (s *service) Update(user User) (*User, error) {
	return s.repo.Update(user)
}

func (s *service) Delete(user User) (*User, error) {
	return s.repo.Delete(user)
}
