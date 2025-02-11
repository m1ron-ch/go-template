package leaked

type Service interface {
	GetAll() ([]Leaked, error)
	GetAllActive() ([]Leaked, error)
	GetAllUnActive() ([]Leaked, error)
	GetAllCapmaingByUserID(userID int) ([]Leaked, error)
	GetByID(leakedID int) (*Leaked, error)
	Create(leak *Leaked) (int, error)
	Update(leak *Leaked) error
	Delete(leakedID int) error
}

type service struct {
	repo Repository
}

func NewLeakedService(r Repository) Service {
	return &service{repo: r}
}

func (s *service) GetAll() ([]Leaked, error) {
	return s.repo.GetAll()
}

func (s *service) GetAllActive() ([]Leaked, error) {
	return s.repo.GetAllActive()
}

func (s *service) GetAllUnActive() ([]Leaked, error) {
	return s.repo.GetAllUnActive()
}

func (s *service) GetAllCapmaingByUserID(userID int) ([]Leaked, error) {
	return s.repo.GetAllCapmaingByUserID(userID)
}

func (s *service) GetByID(id int) (*Leaked, error) {
	return s.repo.GetByID(id)
}

func (s *service) Create(leak *Leaked) (int, error) {
	return s.repo.Create(leak)
}

func (s *service) Update(leak *Leaked) error {
	return s.repo.Update(leak)
}

func (s *service) Delete(leakedID int) error {
	return s.repo.Delete(leakedID)
}
