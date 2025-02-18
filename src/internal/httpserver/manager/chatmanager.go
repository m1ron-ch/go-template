package manager

import (
	"github.com/gorilla/websocket"
)

// Connection описывает одно соединение по WebSocket
type Connection struct {
	Ws     *websocket.Conn
	Send   chan []byte
	ChatID int64 // ID чата (если < 0 — считаем «глобальное» подключение)
	UserID int64
}

// BroadcastMessage для широковещательной рассылки внутри одного чата
type BroadcastMessage struct {
	ChatID int64
	Data   []byte
}

// BroadcastUserMessage для широковещательной рассылки «глобально» конкретному userID
type BroadcastUserMessage struct {
	UserID int64
	Data   []byte
}

type ChatManager struct {
	// ====== 1) Для логики «чат -> пользователи» ======
	Connections map[int64]map[*Connection]bool // ключ: chatID, значение: набор подключений
	Register    chan *Connection               // новое подключение к чату
	Unregister  chan *Connection               // отключение от чата
	Broadcast   chan BroadcastMessage          // отправить сообщение всем в чате

	// ====== 2) Для логики «пользователь -> все его глобальные подключения» (необязательно) ======
	userConnections map[int64]map[*Connection]bool // ключ: userID, значение: набор подключений
	RegisterGlobal  chan *Connection               // новое «глобальное» подключение (ChatID, например, -1)
	BroadcastUser   chan BroadcastUserMessage      // отправить сообщение всем «глобальным» WS у userID
}

// Конструктор
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

// Основной цикл обработки сообщений/регистраций
func (cm *ChatManager) Run() {
	for {
		select {
		// =============== Подключение к конкретному чату ===============
		case conn := <-cm.Register:
			cm.addConnection(conn)

		// =============== Отключение из чата (или глобальное) ===============
		case conn := <-cm.Unregister:
			cm.removeConnection(conn)

		// =============== Широковещательная рассылка в один чат ===============
		case msg := <-cm.Broadcast:
			cm.broadcastToChat(msg.ChatID, msg.Data)

		// =============== Глобальное подключение (по userID) ===============
		case conn := <-cm.RegisterGlobal:
			cm.addGlobalConnection(conn)

		// =============== Широковещательная рассылка всем подключениям userID ===============
		case userMsg := <-cm.BroadcastUser:
			cm.broadcastToUser(userMsg.UserID, userMsg.Data)
		}
	}
}

// 1) Добавить подключение к чату
func (cm *ChatManager) addConnection(conn *Connection) {
	chatID := conn.ChatID
	if cm.Connections[chatID] == nil {
		cm.Connections[chatID] = make(map[*Connection]bool)
	}
	cm.Connections[chatID][conn] = true
}

// 2) Удаляем подключение
func (cm *ChatManager) removeConnection(conn *Connection) {
	chatID := conn.ChatID
	// Если chatID >= 0 — считаем, что это «обычный» чат
	if chatID >= 0 {
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
		// Иначе, считаем, что это «глобальное» подключение (ChatID < 0)
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

// 3) Рассылка данных всем подключениям в указанном чате
func (cm *ChatManager) broadcastToChat(chatID int64, data []byte) {
	conns, ok := cm.Connections[chatID]
	if !ok {
		return
	}
	for conn := range conns {
		select {
		case conn.Send <- data:
		default:
			// Если канал переполнен или при закрытом соединении
			close(conn.Send)
			delete(conns, conn)
		}
	}
}

// 4) Глобальное подключение (ChatID < 0), добавим в userConnections
func (cm *ChatManager) addGlobalConnection(conn *Connection) {
	userID := conn.UserID
	if cm.userConnections[userID] == nil {
		cm.userConnections[userID] = make(map[*Connection]bool)
	}
	cm.userConnections[userID][conn] = true
}

// 5) Рассылка данных всем «глобальным» подключениям userID
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
