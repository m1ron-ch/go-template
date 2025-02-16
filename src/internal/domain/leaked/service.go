package leaked

type Service interface {
	GetAll() ([]Leaked, error)
	GetAllActive() ([]Leaked, error)
	GetAllUnActive(userID int) ([]Leaked, error)
	GetAllCapmaingByUserID(userID int) ([]Leaked, error)
	GetCountNotAccepted() (int, error)
	GetByID(leakedID int) (*Leaked, error)
	Create(leak *Leaked) (int, error)
	Update(leak *Leaked) error
	Delete(leakedID int) error
	Accepted(leakedID int) error
	Reject(leakedID int) error
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

func (s *service) GetAllUnActive(userID int) ([]Leaked, error) {
	return s.repo.GetAllUnActive(userID)
}

func (s *service) GetAllCapmaingByUserID(userID int) ([]Leaked, error) {
	return s.repo.GetAllCapmaingByUserID(userID)
}

func (s *service) GetCountNotAccepted() (int, error) {
	return s.repo.GetCountNotAccepted()
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

func (s *service) Accepted(leakedID int) error {
	return s.repo.Accepted(leakedID)
}
func (s *service) Reject(leakedID int) error {
	return s.repo.Reject(leakedID)
}
