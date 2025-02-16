package editor

type Service interface {
	GetContactUs() (*Editor, error)
	UpdateContactUs(e Editor) error
	GetOrderService() (*Editor, error)
	UpdateOrderService(e Editor) error
	GetTermsConditions() (*Editor, error)
	UpdateTermsConditions(e Editor) error
}

type service struct {
	repo Repository
}

func NewEditorService(r Repository) Service             { return &service{repo: r} }
func (s *service) UpdateContactUs(n Editor) error       { return s.repo.UpdateContactUs(n) }
func (s *service) GetContactUs() (*Editor, error)       { return s.repo.GetContactUs() }
func (s *service) GetOrderService() (*Editor, error)    { return s.repo.GetOrderService() }
func (s *service) UpdateOrderService(e Editor) error    { return s.repo.UpdateOrderService(e) }
func (s *service) GetTermsConditions() (*Editor, error) { return s.repo.GetTermsConditions() }
func (s *service) UpdateTermsConditions(e Editor) error { return s.repo.UpdateTermsConditions(e) }
