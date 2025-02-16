package user

type Repository interface {
	GetAll() ([]User, error)
	GetByID(id int64) (*User, error)
	GetByLogin(login string) (*User, error)
	Authenticate(login, password string) (*User, error)
	Register(user User) (*User, error)
	Update(user User) (*User, error)
	Delete(user User) (*User, error)
}
