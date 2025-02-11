package chat

import (
	"main/internal/domain/user"
	"time"
)

type Chat struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	LastMsg   *string   `json:"last_message"`
	CreatedAt time.Time `json:"created_at"`
}

type Message struct {
	ID        int64      `json:"id"`
	ChatID    int64      `json:"chat_id"`
	Sender    user.User  `json:"sender"`
	Content   string     `json:"content"`
	IsRead    bool       `json:"is_read"`
	IsDeleted bool       `json:"is_deleted"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt *time.Time `json:"updated_at,omitempty"`
}
