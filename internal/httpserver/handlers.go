// internal/httpserver/handler.go
package httpserver

import (
	"encoding/json"
	"fmt"
	"log"
	"main/internal/config"
	"main/internal/domain/chat"
	"main/internal/domain/editor"
	"main/internal/domain/leaked"
	"main/internal/domain/news"
	usedfolders "main/internal/domain/used_folders"
	"main/internal/domain/user"
	"main/internal/httpserver/manager"
	"main/internal/middleware"
	"net/http"
	"path/filepath"
	"runtime"
	"strconv"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

type Handler struct {
	ChatManager    *manager.ChatManager
	foldersService usedfolders.Service
	leakedService  leaked.Service
	editorService  editor.Service
	chatService    chat.Service
	userService    user.Service
	newsService    news.Service
	config         *config.Config
}

func NewHandler(userSrv user.Service, newsSrv news.Service, chatSrv chat.Service, editorSrv editor.Service, leakedSrv leaked.Service, foldersSrv usedfolders.Service, cfg *config.Config, chatMng *manager.ChatManager) *Handler {
	return &Handler{
		foldersService: foldersSrv,
		ChatManager:    chatMng,
		leakedService:  leakedSrv,
		editorService:  editorSrv,
		chatService:    chatSrv,
		userService:    userSrv,
		newsService:    newsSrv,
		config:         cfg,
	}
}

func (h *Handler) SetCORSHeaders(w http.ResponseWriter, method string) {
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Methods", string(method))
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
	w.Header().Set("Access-Control-Allow-Credentials", "true")
}

func (h *Handler) InitRoutes() *mux.Router {
	router := mux.NewRouter()

	_, b, _, _ := runtime.Caller(0)
	basePath := filepath.Dir(filepath.Dir(filepath.Dir(b)))
	path := filepath.Join(basePath, "static")
	router.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir(path))))

	api := router.PathPrefix("/api").Subrouter()
	api.HandleFunc("/login", h.Login).Methods(http.MethodPost)
	api.HandleFunc("/register", h.RegisterUser).Methods(http.MethodPost)
	api.HandleFunc("/auth/me", h.Me).Methods(http.MethodGet)
	api.HandleFunc("/auth/logout", h.Logout).Methods(http.MethodPost)
	api.HandleFunc("/contact_us", h.GetContactUs).Methods(http.MethodGet)
	api.HandleFunc("/terms_and_conditions", h.GetTermsConditions).Methods(http.MethodGet)
	api.HandleFunc("/order_service", h.GetOrderService).Methods(http.MethodGet)
	api.HandleFunc("/news/{id}", h.GetNewsByID).Methods(http.MethodGet)
	api.HandleFunc("/leakeds", h.GetAllLeakeds).Methods(http.MethodGet)
	api.HandleFunc("/campaign", h.GetAllCampaing).Methods(http.MethodGet)
	api.HandleFunc("/media", h.DisplayMedia).Methods(http.MethodGet)
	api.HandleFunc("/news_list", h.GetAllNewsGhost).Methods(http.MethodGet)

	api.HandleFunc("/leakeds_a", h.GetAllActiveLeakeds).Methods(http.MethodGet)
	api.HandleFunc("/leakeds_u", h.GetAllUnACtiveLeakeds).Methods(http.MethodGet)

	api.HandleFunc("/leakeds/{id}", h.GetLeakedsByID).Methods(http.MethodGet)

	private := router.PathPrefix("/api").Subrouter()
	private.Use(middleware.JwtAuthMiddleware(h.config.JWTSecret))

	private.HandleFunc("/users", h.GetUsers).Methods(http.MethodGet)
	private.HandleFunc("/users/{id}", h.GetUserByID).Methods(http.MethodGet)
	private.HandleFunc("/user", h.RegisterUser).Methods(http.MethodPost)
	private.HandleFunc("/users/edit/{id}", h.UpdateUser).Methods(http.MethodPut)
	private.HandleFunc("/users/delete/{id}", h.DeleteUser).Methods(http.MethodDelete)

	private.HandleFunc("/news", h.GetAllNews).Methods(http.MethodGet)
	private.HandleFunc("/news", h.CreateNews).Methods(http.MethodPost)
	private.HandleFunc("/news/{id}", h.UpdateNews).Methods(http.MethodPut)
	private.HandleFunc("/news/{id}", h.DeleteNews).Methods(http.MethodDelete)

	private.HandleFunc("/chats", h.GetAllChats).Methods(http.MethodGet)      // GET /api/chats
	private.HandleFunc("/chats/{id}", h.GetChatByID).Methods(http.MethodGet) // GET /api/chats/{id}
	private.HandleFunc("/chats", h.CreateChat).Methods(http.MethodPost)      // POST /api/chats
	private.HandleFunc("/chats/{id}", h.UpdateChat).Methods(http.MethodPut)  // PUT /api/chats/{id}
	private.HandleFunc("/chats/{id}", h.DeleteChat).Methods(http.MethodDelete)

	private.HandleFunc("/chats_user/{id}", h.GetAllChatsByLeakedID).Methods(http.MethodGet)

	api.HandleFunc("/chats/{id}/messages", h.GetAllMessagesByChat).Methods(http.MethodGet)
	api.HandleFunc("/messages", h.CreateMessage).Methods(http.MethodPost)
	private.HandleFunc("/messages/{id}", h.EditMessage).Methods(http.MethodPut)
	private.HandleFunc("/messages/{id}", h.DeleteMessage).Methods(http.MethodDelete)

	private.HandleFunc("/contact_us/update", h.UpdateContactUs).Methods(http.MethodPost)
	private.HandleFunc("/terms_and_conditions/update", h.UpdateTermsConditions).Methods(http.MethodPost)
	private.HandleFunc("/order_service/update", h.UpdateOrderService).Methods(http.MethodPost)

	private.HandleFunc("/leakeds", h.CreateLeaked).Methods(http.MethodPost)
	private.HandleFunc("/leakeds/{id}", h.UpdateLeaked).Methods(http.MethodPut)
	private.HandleFunc("/leakeds/{id}", h.DeleteLeaked).Methods(http.MethodDelete)

	private.HandleFunc("/files", h.GetAllFiles).Methods(http.MethodGet)

	private.HandleFunc("/campaign", h.CreateCampaing).Methods(http.MethodPost)

	private.HandleFunc("/leaked-not-accepted", h.GetCountNotAccepted).Methods(http.MethodGet)

	private.HandleFunc("/upload", h.UploadMediaHandle).Methods(http.MethodPost)

	private.HandleFunc("/generate_archive", h.GenerateCompanyArchive).Methods(http.MethodPost)

	private.HandleFunc("/blog", h.Blog).Methods(http.MethodPost)

	private.HandleFunc("/leakeds/{id}/accept", h.LeakedAccepted).Methods(http.MethodPut)
	private.HandleFunc("/leakeds/{id}/reject", h.LeakedReject).Methods(http.MethodPut)

	router.HandleFunc("/ws/chat", h.chatWebSocket).Methods(http.MethodGet)

	uiPath := filepath.Join(basePath, "ui")
	assetsPath := filepath.Join(uiPath, "dist", "assets")

	assetsDir := http.Dir(assetsPath)
	router.PathPrefix("/assets/").
		Handler(http.StripPrefix("/assets/", http.FileServer(assetsDir)))

	// router.Handle("/metrics", promhttp.Handler())

	fmt.Println(filepath.Join(uiPath, "dist", "assets"))
	fmt.Println(filepath.Join(uiPath, "index.html"))

	router.PathPrefix("/").
		HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			http.ServeFile(w, r, filepath.Join(uiPath, "dist", "index.html"))
		})

	router.Use(handlers.RecoveryHandler())
	router.Use(middleware.TrustProxy(middleware.PrivateRanges()))
	router.Use(middleware.Logger())

	return router
}

type Connection = manager.Connection

func (h *Handler) chatWebSocket(w http.ResponseWriter, r *http.Request) {
	fmt.Println("chat websocket")

	chatIDStr := r.URL.Query().Get("chat_id")
	if chatIDStr == "" {
		log.Println("chat_id required")
		http.Error(w, "chat_id required", http.StatusBadRequest)
		return
	}
	chatID, err := strconv.ParseInt(chatIDStr, 10, 64)
	if err != nil {
		log.Println("invalid chat_id")
		http.Error(w, "invalid chat_id", http.StatusBadRequest)
		return
	}

	userIDStr := r.URL.Query().Get("user_id")
	if chatIDStr == "" {
		log.Println("user_id required")
		http.Error(w, "user_id required", http.StatusBadRequest)
		return
	}
	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		log.Println("invalid user_id")
		http.Error(w, "invalid user_id", http.StatusBadRequest)
		return
	}

	fmt.Println(fmt.Sprintf("chat id %d", chatID))
	fmt.Println(fmt.Sprintf("user id %d", userID))

	wsConn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("upgrade error:", err)
		return
	}

	conn := &Connection{
		Ws:     wsConn,
		Send:   make(chan []byte, 256),
		UserID: userID,
		ChatID: chatID,
	}

	h.ChatManager.Register <- conn
	go writePump(conn)
	readPump(h, conn)
}

// --- методы для create/edit/delete:

func (h *Handler) createMessage(c *Connection, content string) {
	msgID, err := h.chatService.CreateMessage(c.ChatID, c.UserID, content)
	if err != nil {
		log.Println("createMessage error:", err)
		return
	}

	user, err := h.userService.GetUserByID(c.UserID)
	if err != nil {
		log.Println(err.Error())
	}

	out := OutgoingMessage{
		Action:    "create",
		MessageID: msgID,
		Content:   content,
		SenderID:  c.UserID,
		ChatID:    c.ChatID,
		Login:     user.Login,
		RoleID:    user.RoleID,
	}
	data, _ := json.Marshal(out)
	h.ChatManager.Broadcast <- manager.BroadcastMessage{
		ChatID: c.ChatID,
		Data:   data,
	}
}

func (h *Handler) editMessage(c *Connection, msgID int64, newContent string) {
	err := h.chatService.EditMessage(msgID, c.UserID, newContent)
	if err != nil {
		log.Println("editMessage error:", err)
		return
	}
	out := OutgoingMessage{
		Action:    "edit",
		MessageID: msgID,
		Content:   newContent,
		SenderID:  c.UserID,
		ChatID:    c.ChatID,
	}
	data, _ := json.Marshal(out)
	h.ChatManager.Broadcast <- manager.BroadcastMessage{
		ChatID: c.ChatID,
		Data:   data,
	}
}

func (h *Handler) deleteMessage(c *Connection, msgID int64) {
	err := h.chatService.DeleteMessage(msgID, c.UserID)
	if err != nil {
		log.Println("deleteMessage error:", err)
		return
	}
	out := OutgoingMessage{
		Action:    "delete",
		MessageID: msgID,
		SenderID:  c.UserID,
		ChatID:    c.ChatID,
	}
	data, _ := json.Marshal(out)
	h.ChatManager.Broadcast <- manager.BroadcastMessage{
		ChatID: c.ChatID,
		Data:   data,
	}
}
