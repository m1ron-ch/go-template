package leaked

type Repository interface {
	GetAll() ([]Leaked, error)
	GetByID(leakedID int) (*Leaked, error)
	GetAllActive() ([]Leaked, error)
	GetAllUnActive(userID int) ([]Leaked, error)
	GetAllCapmaingByUserID(userID int) ([]Leaked, error)
	GetCountNotAccepted() (int, error)
	Create(leak *Leaked) (int, error)
	Update(leak *Leaked) error
	Delete(leakedID int) error
	Accepted(leakedID int) error
	Reject(leakedID int) error
}
