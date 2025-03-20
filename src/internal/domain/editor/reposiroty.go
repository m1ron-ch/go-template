package editor

type Repository interface {
	GetContactUs() (*Editor, error)
	UpdateContactUs(e Editor) error
	GetOrderService() (*Editor, error)
	UpdateOrderService(e Editor) error
	GetTermsConditions() (*Editor, error)
	UpdateTermsConditions(e Editor) error
}
