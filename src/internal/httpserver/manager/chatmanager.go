package manager

import (
	"github.com/gorilla/websocket"
)

// Connection описывает одно соединение по WebSocket.
type Connection struct {
	Ws     *websocket.Conn
	Send   chan []byte
	ChatID int64 // ID чата (если < 0 — считаем «глобальное» подключение).
	UserID int64
}

// BroadcastMessage для широковещательной рассылки внутри одного чата.
type BroadcastMessage struct {
	ChatID int64
	Data   []byte
}

// BroadcastUserMessage для широковещательной рассылки «глобально» конкретному userID.
type BroadcastUserMessage struct {
	UserID int64
	Data   []byte
}

// ChatManager управляет всеми WebSocket-подключениями.
// 1) Управление по chatID — Connections.
// 2) Управление глобальными соединениями по userID — userConnections.
type ChatManager struct {
	// Подключения к конкретным чатам: ключ chatID -> набор Conn.
	Connections map[int64]map[*Connection]bool
	Register    chan *Connection
	Unregister  chan *Connection
	Broadcast   chan BroadcastMessage

	// Глобальные подключения по userID (ChatID < 0).
	userConnections map[int64]map[*Connection]bool
	RegisterGlobal  chan *Connection
	BroadcastUser   chan BroadcastUserMessage
}

// NewChatManager конструктор.
func NewChatManager() *ChatManager {
	return &ChatManager{
		Connections: make(map[int64]map[*Connection]bool),
		Register:    make(chan *Connection),
		Unregister:  make(chan *Connection),
		Broadcast:   make(chan BroadcastMessage),

		userConnections: make(map[int64]map[*Connection]bool),
		RegisterGlobal:  make(chan *Connection),
		BroadcastUser:   make(chan BroadcastUserMessage),
	}
}

// Run запускает главный цикл обработки подключений и рассылок.
func (cm *ChatManager) Run() {
	for {
		select {
		// Подключение к конкретному чату.
		case conn := <-cm.Register:
			cm.addConnection(conn)

		// Отключение из чата (или «глобальное» отключение).
		case conn := <-cm.Unregister:
			cm.removeConnection(conn)

		// Широковещательная рассылка внутри одного чата.
		case msg := <-cm.Broadcast:
			cm.broadcastToChat(msg.ChatID, msg.Data)

		// «Глобальное» подключение (ChatID < 0).
		case conn := <-cm.RegisterGlobal:
			cm.addGlobalConnection(conn)

		// Широковещательная рассылка по userID (во все глобальные сокеты пользователя).
		case userMsg := <-cm.BroadcastUser:
			cm.broadcastToUser(userMsg.UserID, userMsg.Data)
		}
	}
}

// 1) Добавить подключение к чату.
func (cm *ChatManager) addConnection(conn *Connection) {
	chatID := conn.ChatID
	if cm.Connections[chatID] == nil {
		cm.Connections[chatID] = make(map[*Connection]bool)
	}
	cm.Connections[chatID][conn] = true
}

// 2) Удалить подключение (из чата или глобальное).
func (cm *ChatManager) removeConnection(conn *Connection) {
	chatID := conn.ChatID
	if chatID >= 0 {
		// Это «обычный» чат.
		if conns, ok := cm.Connections[chatID]; ok {
			if _, found := conns[conn]; found {
				delete(conns, conn)
				close(conn.Send)
				if len(conns) == 0 {
					delete(cm.Connections, chatID)
				}
			}
		}
	} else {
		// Иначе — «глобальное» подключение (ChatID < 0).
		userID := conn.UserID
		if uc, ok := cm.userConnections[userID]; ok {
			if _, found := uc[conn]; found {
				delete(uc, conn)
				close(conn.Send)
				if len(uc) == 0 {
					delete(cm.userConnections, userID)
				}
			}
		}
	}
}

// 3) Рассылка всем подключениям в указанном чате.
func (cm *ChatManager) broadcastToChat(chatID int64, data []byte) {
	conns, ok := cm.Connections[chatID]
	if !ok {
		return
	}
	for conn := range conns {
		select {
		case conn.Send <- data:
		default:
			// Если канал переполнен или закрыт, закрываем соединение.
			close(conn.Send)
			delete(conns, conn)
		}
	}
}

// 4) Глобальное подключение добавляется в userConnections.
func (cm *ChatManager) addGlobalConnection(conn *Connection) {
	userID := conn.UserID
	if cm.userConnections[userID] == nil {
		cm.userConnections[userID] = make(map[*Connection]bool)
	}
	cm.userConnections[userID][conn] = true
}

// 5) Рассылка всем «глобальным» подключениям userID.
func (cm *ChatManager) broadcastToUser(userID int64, data []byte) {
	conns, ok := cm.userConnections[userID]
	if !ok {
		return
	}
	for conn := range conns {
		select {
		case conn.Send <- data:
		default:
			close(conn.Send)
			delete(conns, conn)
		}
	}
}
