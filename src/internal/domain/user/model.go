package user

type User struct {
	ID       int64  `json:"id"`
	Name     string `json:"name"`
	Login    string `json:"login"`
	RoleID   int    `json:"role_id"`
	StatusID int    `json:"status_id"`
	Password string `json:"password"`
}
