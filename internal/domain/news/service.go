package news

type Service interface {
	GetAllNews() ([]News, error)
	GetAllGhost() ([]News, error)
	GetNewsByID(id int64) (*News, error)
	CreateNews(n News) error
	UpdateNews(n News) error
	DeleteNews(id int64) error
}

type service struct {
	repo Repository
}

func NewNewsService(r Repository) Service {
	return &service{repo: r}
}

func (s *service) GetAllNews() ([]News, error) {
	return s.repo.GetAll()
}

func (s *service) GetAllGhost() ([]News, error) {
	return s.repo.GetAllGhost()
}

func (s *service) GetNewsByID(id int64) (*News, error) {
	return s.repo.GetByID(id)
}

func (s *service) CreateNews(n News) error {
	return s.repo.Create(n)
}

func (s *service) UpdateNews(n News) error {
	return s.repo.Update(n)
}

func (s *service) DeleteNews(id int64) error {
	return s.repo.Delete(id)
}
