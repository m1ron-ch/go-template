package user

type Repository interface {
	GetAll() ([]User, error)
	GetByID(id int64) (*User, error)
}
