// internal/repository/mysql/user_repository.go
package mysql

import (
	"database/sql"
	"main/internal/domain/user"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) user.Repository {
	return &UserRepository{db: db}
}

func (r *UserRepository) GetAll() ([]user.User, error) {
	rows, err := r.db.Query("SELECT id, name FROM users")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []user.User
	for rows.Next() {
		var u user.User
		if err := rows.Scan(&u.ID, &u.Name); err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	return users, nil
}

func (r *UserRepository) GetByID(id int64) (*user.User, error) {
	row := r.db.QueryRow("SELECT id, name FROM users WHERE id = ?", id)

	var u user.User
	if err := row.Scan(&u.ID, &u.Name); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &u, nil
}
