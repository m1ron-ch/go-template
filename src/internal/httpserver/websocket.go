package httpserver

import (
	"encoding/json"
	"log"
	"main/internal/httpserver/manager"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
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
	c.Ws.SetReadLimit(512)
	c.Ws.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.Ws.SetPongHandler(func(string) error {
		c.Ws.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, message, err := c.Ws.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}

		log.Println("Received WebScoket message:", string(message))

		var incoming struct {
			Action    string `json:"action"`
			Content   string `json:"content"`
			MessageID int64  `json:"message_id"`
		}
		if err := json.Unmarshal(message, &incoming); err != nil {
			log.Println("unmarshal error:", err)
			continue
		}

		log.Println("Parsed Action:", incoming.Action)

		switch incoming.Action {
		case "create":
			h.createMessage(c, incoming.Content)
		case "edit":
			h.editMessage(c, incoming.MessageID, incoming.Content)
		case "delete":
			h.deleteMessage(c, incoming.MessageID)
		default:
			log.Println("unknown action:", incoming.Action)
		}
	}
}

func writePump(c *manager.Connection) {
	ticker := time.NewTicker(54 * time.Second)
	defer func() {
		ticker.Stop()
		c.Ws.Close()
	}()
	for {
		select {
		case message, ok := <-c.Send:
			c.Ws.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.Ws.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			w, err := c.Ws.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.Ws.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.Ws.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
