package leaked

type Repository interface {
	GetAll() ([]Leaked, error)
	GetByID(leakedID int) (*Leaked, error)
	GetAllActive() ([]Leaked, error)
	GetAllUnActive() ([]Leaked, error)
	GetAllCapmaingByUserID(userID int) ([]Leaked, error)
	Create(leak *Leaked) (int, error)
	Update(leak *Leaked) error
	Delete(leakedID int) error
}
