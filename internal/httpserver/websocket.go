package httpserver

import (
	"encoding/json"
	"fmt"
	"log"
	"main/internal/httpserver/manager"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// CORS
	CheckOrigin: func(r *http.Request) bool {
		return true // или более строго
	},
}

type IncomingMessage struct {
	Action    string `json:"action"`
	MessageID int64  `json:"message_id"`
	Content   string `json:"content"`
}

type OutgoingMessage struct {
	Action    string `json:"action"`
	MessageID int64  `json:"message_id"`
	Content   string `json:"content"`
	SenderID  int64  `json:"sender_id"`
	ChatID    int64  `json:"chat_id"`
	RoleID    int    `json:"role_id"`
	Login     string `json:"login"`
}

func readPump(h *Handler, c *manager.Connection) {
	defer func() {
		h.ChatManager.Unregister <- c
		c.Ws.Close()
	}()
	for {
		_, msgData, err := c.Ws.ReadMessage()
		if err != nil {
			log.Println("readPump error:", err)
			break
		}
		var inMsg IncomingMessage
		if err := json.Unmarshal(msgData, &inMsg); err != nil {
			log.Println("json parse error:", err)
			continue
		}

		fmt.Println(inMsg)
		switch inMsg.Action {
		case "create":
			h.createMessage(c, inMsg.Content)
		case "edit":
			h.editMessage(c, inMsg.MessageID, inMsg.Content)
		case "delete":
			h.deleteMessage(c, inMsg.MessageID)
		}
	}
}

func writePump(c *manager.Connection) {
	defer c.Ws.Close()
	for {
		select {
		case data, ok := <-c.Send:
			if !ok {
				c.Ws.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			c.Ws.WriteMessage(websocket.TextMessage, data)
		}
	}
}
