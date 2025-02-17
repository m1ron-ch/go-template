package chat

import "main/internal/domain/user"

type Repository interface {
	CreateChat(name string, owner_id, leaked_id int) (int64, error)
	GetChatByID(chatID int64) (*Chat, error)
	GetAllChats(user *user.User) ([]Chat, error)
	GetAllChatsByLeakedID(user *user.User, leakedId int) ([]Chat, error)
	UpdateChat(chatID int64, newName string) error
	DeleteChat(chatID int64) error

	GetAllMessagesByChat(chatID int64) ([]Message, error)
	CreateMessage(chatID, senderID int64, content string) (int64, error)
	EditMessage(msgID, senderID int64, newContent string) error
	DeleteMessage(msgID, senderID int64) error
	UpdateUnReadMsg(chatID, userID int) error
}
