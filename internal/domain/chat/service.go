package chat

import "main/internal/domain/user"

type Service interface {
	CreateChat(name string, owner_id, leaked_id int) (int64, error)
	GetChatByID(chatID int64) (*Chat, error)
	GetAllChatsByLeakedID(user *user.User, leakedId int) ([]Chat, error)
	GetAllChats(user *user.User) ([]Chat, error)
	UpdateChat(chatID int64, newName string) error
	DeleteChat(chatID int64) error

	GetAllMessagesByChat(chatID int64) ([]Message, error)
	CreateMessage(chatID, senderID int64, content string) (int64, error)
	EditMessage(msgID, senderID int64, newContent string) error
	DeleteMessage(msgID, senderID int64) error
}

type service struct {
	repo Repository
}

func NewService(r Repository) Service {
	return &service{repo: r}
}

func (s *service) GetAllMessagesByChat(chatID int64) ([]Message, error) {
	return s.repo.GetAllMessagesByChat(chatID)
}

func (s *service) CreateMessage(chatID, senderID int64, content string) (int64, error) {
	return s.repo.CreateMessage(chatID, senderID, content)
}

func (s *service) EditMessage(msgID, senderID int64, newContent string) error {
	return s.repo.EditMessage(msgID, senderID, newContent)
}

func (s *service) DeleteMessage(msgID, senderID int64) error {
	return s.repo.DeleteMessage(msgID, senderID)
}

func (s *service) CreateChat(name string, owner_id, leaked_id int) (int64, error) {
	return s.repo.CreateChat(name, owner_id, leaked_id)
}

func (s *service) GetChatByID(chatID int64) (*Chat, error) {
	return s.repo.GetChatByID(chatID)
}

func (s *service) GetAllChatsByLeakedID(user *user.User, leakedId int) ([]Chat, error) {
	return s.repo.GetAllChatsByLeakedID(user, leakedId)
}

func (s *service) GetAllChats(user *user.User) ([]Chat, error) {
	return s.repo.GetAllChats(user)
}

func (s *service) UpdateChat(chatID int64, newName string) error {
	return s.repo.UpdateChat(chatID, newName)
}

func (s *service) DeleteChat(chatID int64) error {
	return s.repo.DeleteChat(chatID)
}
