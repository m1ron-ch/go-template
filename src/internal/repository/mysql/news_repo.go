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
	rows, err := r.db.Query(`SELECT n.uid, n.title, n.preview, n.content, n.created_at, n.is_visibility, n.image, u.login, u.name, n.json
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
		if err := rows.Scan(&n.ID, &n.Title, &n.Preview, &n.Content, &n.CreatedAt, &n.IsVisibility, &n.Image, &n.User.Login, &n.User.Name, &n.Json); err != nil {
			return nil, err
		}

		datetime := strings.Split(n.CreatedAt.Local().String(), " ")
		n.DateCreatedAt = datetime[0]
		n.TimeCreatedAt = datetime[1]

		newsList = append(newsList, n)
	}
	return newsList, nil
}

func (r *NewsRepository) GetAllGhost() ([]news.News, error) {
	rows, err := r.db.Query(`SELECT n.uid, n.title, n.preview, n.content, n.created_at, n.is_visibility, n.image, u.login, u.name, n.json
FROM news n
INNER JOIN users u ON u.uid = n.user_id
WHERE n.is_visibility = 1
ORDER BY n.uid DESC;`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var newsList []news.News
	for rows.Next() {
		var n news.News
		if err := rows.Scan(&n.ID, &n.Title, &n.Preview, &n.Content, &n.CreatedAt, &n.IsVisibility, &n.Image, &n.User.Login, &n.User.Name, &n.Json); err != nil {
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
	row := r.db.QueryRow(`
		SELECT n.uid, n.title, n.preview, n.image, n.content, n.created_at, n.is_visibility, n.JSON, u.name
		FROM news n
		INNER JOIN users u ON u.uid = n.user_id
		WHERE n.uid = ?`, id)

	var n news.News
	if err := row.Scan(&n.ID, &n.Title, &n.Preview, &n.Image, &n.Content, &n.CreatedAt, &n.IsVisibility, &n.Json, &n.User.Name); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &n, nil
}

func (r *NewsRepository) Create(n news.News) error {
	_, err := r.db.Exec("INSERT INTO news (title, content, is_visibility, image, user_id, preview, json) VALUES (?, ?, ?, ?, ?, ?, ?)",
		n.Title, n.Content, n.IsVisibility, n.Image, n.UserID, n.Preview, n.Json)
	return err
}

func (r *NewsRepository) Update(n news.News) error {
	_, err := r.db.Exec("UPDATE news SET title = ?, content = ?, is_visibility = ?, image = ?, user_id = ?, preview = ?, json = ? WHERE uid = ?",
		n.Title, n.Content, n.IsVisibility, n.Image, n.User.ID, n.Preview, n.Json, n.ID)
	return err
}

func (r *NewsRepository) Delete(id int64) error {
	_, err := r.db.Exec("DELETE FROM news WHERE id = ?", id)
	return err
}
