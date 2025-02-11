package mysql

import (
	"database/sql"
	"main/internal/domain/news"
	"strings"
)

type NewsRepository struct {
	db *sql.DB
}

func NewNewsRepository(db *sql.DB) news.Repository {
	return &NewsRepository{db: db}
}

func (r *NewsRepository) GetAll() ([]news.News, error) {
	rows, err := r.db.Query(`SELECT n.uid, n.title, n.description, n.content, n.created_at, n.is_visibility, n.image, u.login, u.name
FROM news n
INNER JOIN users u ON u.uid = n.user_id
ORDER BY n.uid DESC;`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var newsList []news.News
	for rows.Next() {
		var n news.News
		if err := rows.Scan(&n.ID, &n.Title, &n.Description, &n.Content, &n.CreatedAt, &n.IsVisibility, &n.Image, &n.User.Login, &n.User.Name); err != nil {
			return nil, err
		}

		datetime := strings.Split(n.CreatedAt.Local().String(), " ")
		n.DateCreatedAt = datetime[0]
		n.TimeCreatedAt = datetime[1]

		newsList = append(newsList, n)
	}
	return newsList, nil
}

func (r *NewsRepository) GetByID(id int64) (*news.News, error) {
	row := r.db.QueryRow("SELECT uid, title, image, content, created_at FROM news WHERE uid = ?", id)

	var n news.News
	if err := row.Scan(&n.ID, &n.Title, &n.Image, &n.Content, &n.CreatedAt); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &n, nil
}

func (r *NewsRepository) Create(n news.News) error {
	_, err := r.db.Exec("INSERT INTO news (title, content, is_visibility, image, user_id, description, json) VALUES (?, ?, ?, ?, ?, ?, ?)",
		n.Title, n.Content, n.IsVisibility, n.Image, n.UserID, n.Description, n.Json)
	return err
}

func (r *NewsRepository) Update(n news.News) error {
	_, err := r.db.Exec("UPDATE news SET title = ?, content = ? WHERE id = ?",
		n.Title, n.Content, n.ID)
	return err
}

func (r *NewsRepository) Delete(id int64) error {
	_, err := r.db.Exec("DELETE FROM news WHERE id = ?", id)
	return err
}
