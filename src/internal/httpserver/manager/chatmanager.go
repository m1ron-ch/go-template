package manager

import "github.com/gorilla/websocket"

type Connection struct {
	Send   chan []byte
	ChatID int64
	UserID int64
	Ws     *websocket.Conn
}

type BroadcastMessage struct {
	ChatID int64
	Data   []byte
}

type ChatManager struct {
	Connections map[int64]map[*Connection]bool
	Register    chan *Connection
	Unregister  chan *Connection
	Broadcast   chan BroadcastMessage
}

func NewChatManager() *ChatManager {
	return &ChatManager{
		Connections: make(map[int64]map[*Connection]bool),
		Register:    make(chan *Connection),
		Unregister:  make(chan *Connection),
		Broadcast:   make(chan BroadcastMessage),
	}
}

func (cm *ChatManager) Run() {
	for {
		select {
		case conn := <-cm.Register:
			cm.addConnection(conn)
		case conn := <-cm.Unregister:
			cm.removeConnection(conn)
		case msg := <-cm.Broadcast:
			cm.broadcastToChat(msg.ChatID, msg.Data)
		}
	}
}

func (cm *ChatManager) addConnection(conn *Connection) {
	if cm.Connections[conn.ChatID] == nil {
		cm.Connections[conn.ChatID] = make(map[*Connection]bool)
	}
	cm.Connections[conn.ChatID][conn] = true
}

func (cm *ChatManager) removeConnection(conn *Connection) {
	if conns, ok := cm.Connections[conn.ChatID]; ok {
		if _, found := conns[conn]; found {
			delete(conns, conn)
			close(conn.Send)
			if len(conns) == 0 {
				delete(cm.Connections, conn.ChatID)
			}
		}
	}
}

func (cm *ChatManager) broadcastToChat(chatID int64, data []byte) {
	conns, ok := cm.Connections[chatID]
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
