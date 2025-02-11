package news

type Repository interface {
	GetAll() ([]News, error)
	GetByID(id int64) (*News, error)
	Create(n News) error
	Update(n News) error
	Delete(id int64) error
}
