package leaked

import (
	"main/internal/domain/user"
	"time"
)

type Leaked struct {
	ID          int                `json:"id"`
	Status      int                `json:"status"`
	Blog        string             `json:"blog"` // Сделано с большой буквы для экспорта
	CreateAt    time.Time          `json:"-"`
	CompanyName string             `json:"company_name"`
	Description string             `json:"description"`
	Website     string             `json:"website"`
	User        user.User          `json:"user"` // Пользователь с login и uid
	Expires     *time.Time         `json:"-"`    // Указатель, чтобы можно было вернуть nil, если поле пустое
	LogoUrl     string             `json:"logo_url"`
	Screenshots []LeakedScreenshot `json:"screenshots"`
	Links       []LeakedUrls       `json:"urls"`
	Payout      float64            `json:"payout"`
	PayoutUnit  int                `json:"payout_unit"`
	Builder     int                `json:"builder"`
	Publish     int                `json:"publish"`
	IsAccept    int                `json:"is_accept"`

	CreatedAtStr string `json:"created_at"`
	ExpiresStr   string `json:"expires"`
}

type LeakedScreenshot struct {
	ID       int    `json:"id"`
	ImageURL string `json:"image_url"`
}

type LeakedUrls struct {
	ID  int    `json:"id"`
	Url string `json:"url"`
}
