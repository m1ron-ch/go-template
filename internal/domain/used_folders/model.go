package usedfolders

import (
	"main/internal/domain/leaked"
	"main/internal/domain/user"
	"time"
)

type File struct {
	ID            int           `json:"id"`
	User          user.User     `json:"user"`
	Leaked        leaked.Leaked `json:"leaked"`
	FolderName    string        `json:"folder_name"`
	ArchiveNumber string        `json:"archive_number"`
	Status        string        `json:"status"`
	CreatedAt     *time.Time    `json:"created_at"`
}
