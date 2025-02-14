package mysql

import (
	"database/sql"
	"fmt"
	"main/internal/domain/chat"
	"main/internal/domain/user"
	"time"
)

type ChatRepository struct {
	db *sql.DB
}

func NewChatRepository(db *sql.DB) chat.Repository {
	return &ChatRepository{db: db}
}

func (r *ChatRepository) CreateChat(name string, owner_id, leaked_id int) (int64, error) {
	var res sql.Result
	var err error

	if leaked_id > 0 {
		res, err = r.db.Exec("INSERT INTO chats (name, owner_id, leaked_id) VALUES (?, ?, ?)", name, owner_id, leaked_id)
	} else {
		res, err = r.db.Exec("INSERT INTO chats (name, owner_id) VALUES (?, ?)", name, owner_id)
	}
	if err != nil {
		return 0, err
	}

	return res.LastInsertId()
}

// GetChatByID fetches a single chat by ID
func (r *ChatRepository) GetChatByID(chatID int64) (*chat.Chat, error) {
	var c chat.Chat
	query := `SELECT id, name, created_at FROM chats WHERE id=?`
	row := r.db.QueryRow(query, chatID)

	err := row.Scan(&c.ID, &c.Name, &c.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	} else if err != nil {
		return nil, err
	}
	return &c, nil
}

// GetAllChats returns all chats
func (r *ChatRepository) GetAllChats(user *user.User) ([]chat.Chat, error) {
	var query string
	if user.RoleID == 1 {
		query = `SELECT c.id, c.name, c.created_at, m.content AS last_message
		FROM chats c
		LEFT JOIN messages m 
				ON m.id = (
						SELECT m2.id
						FROM messages m2
						WHERE m2.chat_id = c.id
						ORDER BY m2.id DESC
						LIMIT 1
				)
		ORDER BY id DESC;`
	} else {
		query = fmt.Sprintf(`SELECT c.id, c.name, c.created_at, m.content AS last_message
		FROM chats c
		LEFT JOIN messages m 
				ON m.id = (
						SELECT m2.id
						FROM messages m2
						WHERE m2.chat_id = c.id
						ORDER BY m2.id DESC
						LIMIT 1
				)
		WHERE c.owner_id = %d;`, user.ID)
	}

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var chatsList []chat.Chat
	for rows.Next() {
		var c chat.Chat
		if err := rows.Scan(&c.ID, &c.Name, &c.CreatedAt, &c.LastMsg); err != nil {
			return nil, err
		}
		chatsList = append(chatsList, c)
	}
	return chatsList, rows.Err()
}

func (r *ChatRepository) GetAllChatsByLeakedID(user *user.User, leakedId int) ([]chat.Chat, error) {
	query := fmt.Sprintf(`SELECT c.id, c.name, c.created_at, m.content AS last_message
	FROM chats c
	LEFT JOIN messages m 
			ON m.id = (
					SELECT m2.id
					FROM messages m2
					WHERE m2.chat_id = c.id
					ORDER BY m2.id DESC
					LIMIT 1
			)
	WHERE c.owner_id = %d AND leaked_id = %d;`, user.ID, leakedId)

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var chatsList []chat.Chat
	for rows.Next() {
		var c chat.Chat
		if err := rows.Scan(&c.ID, &c.Name, &c.CreatedAt, &c.LastMsg); err != nil {
			return nil, err
		}
		chatsList = append(chatsList, c)
	}
	return chatsList, rows.Err()
}

// UpdateChat updates the name of a chat
func (r *ChatRepository) UpdateChat(chatID int64, newName string) error {
	query := `UPDATE chats SET name=? WHERE id=?`
	_, err := r.db.Exec(query, newName, chatID)
	return err
}

// DeleteChat removes a chat by ID
func (r *ChatRepository) DeleteChat(chatID int64) error {
	query := `DELETE FROM chats WHERE id=?`
	_, err := r.db.Exec(query, chatID)
	return err
}

// CreateMessage creates a new message in a given chat
func (r *ChatRepository) CreateMessage(chatID, senderID int64, content string) (int64, error) {
	result, err := r.db.Exec("INSERT INTO messages (chat_id, sender_id, content) VALUES (?,?,?)", chatID, senderID, content)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

// EditMessage updates message content (if not deleted)
func (r *ChatRepository) EditMessage(msgID, senderID int64, newContent string) error {
	query := `UPDATE messages SET content=?, updated_at=?
						WHERE id=? AND sender_id=? AND is_deleted=false`
	_, err := r.db.Exec(query, newContent, time.Now(), msgID, senderID)
	return err
}

// DeleteMessage marks message as deleted (logical delete)
func (r *ChatRepository) DeleteMessage(msgID, senderID int64) error {
	query := `UPDATE messages SET is_deleted=true, updated_at=?
						WHERE id=? AND sender_id=? AND is_deleted=false`
	_, err := r.db.Exec(query, time.Now(), msgID, senderID)
	return err
}

// GetAllMessagesByChat retrieves all messages of a chat
func (r *ChatRepository) GetAllMessagesByChat(chatID int64) ([]chat.Message, error) {
	query := `SELECT m.id, m.chat_id, m.content, m.is_read, m.is_deleted, m.created_at, m.updated_at, u.uid, u.login, u.role_id
		FROM messages m
		INNER JOIN users u ON u.uid = m.sender_id
		WHERE m.chat_id=?
		ORDER BY m.created_at ASC`
	rows, err := r.db.Query(query, chatID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var msgs []chat.Message
	for rows.Next() {
		var m chat.Message
		var updatedAt sql.NullTime
		err := rows.Scan(&m.ID, &m.ChatID, &m.Content, &m.IsRead, &m.IsDeleted, &m.CreatedAt, &updatedAt, &m.Sender.ID, &m.Sender.Login, &m.Sender.RoleID)
		if err != nil {
			return nil, err
		}
		if updatedAt.Valid {
			t := updatedAt.Time
			m.UpdatedAt = &t
		}
		msgs = append(msgs, m)
	}
	return msgs, rows.Err()
}

// GetMessageByID retrieves a single message
func (r *ChatRepository) GetMessageByID(msgID int64) (*chat.Message, error) {
	query := `SELECT id, chat_id, sender_id, content, is_read, is_deleted, created_at, updated_at
						FROM messages
						WHERE id=?`
	row := r.db.QueryRow(query, msgID)
	var m chat.Message
	var updatedAt sql.NullTime
	err := row.Scan(&m.ID, &m.ChatID, &m.Sender.ID, &m.Content, &m.IsRead, &m.IsDeleted, &m.CreatedAt, &updatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	} else if err != nil {
		return nil, err
	}
	if updatedAt.Valid {
		t := updatedAt.Time
		m.UpdatedAt = &t
	}
	return &m, nil
}
