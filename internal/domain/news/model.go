package news

import (
	"main/internal/domain/user"
	"time"
)

type News struct {
	ID            int64      `json:"id"`
	Title         string     `json:"title"`
	IsVisibility  bool       `json:"is_visibility"`
	Content       string     `json:"content"`
	CreatedAt     *time.Time `json:"created_at"`
	DateCreatedAt string     `json:"date"`
	TimeCreatedAt string     `json:"time"`
	User          user.User  `json:"user"`
	Image         string     `json:"image"`
	Description   string     `json:"description"`
	UserID        int        `json:"user_id"`
	Json          string     `json:"json"`
}
