package httpserver

import (
	"net/http"
	"time"
)

func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	// Создаём «заглушку» cookie с тем же именем и путём,
	// но с истёкшим сроком действия
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    "",
		Expires:  time.Unix(0, 0),
		Path:     "/",
		HttpOnly: true,
		// Secure:  true, если у вас HTTPS
		// SameSite: http.SameSiteStrictMode и т.д.
	})

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message":"cookie deleted"}`))
}
