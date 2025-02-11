// internal/repository/mysql/user_repository.go
package mysql

import (
	"database/sql"
	"errors"
	"main/internal/domain/user"

	"golang.org/x/crypto/bcrypt"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) user.Repository {
	return &UserRepository{db: db}
}

func (r *UserRepository) GetAll() ([]user.User, error) {
	rows, err := r.db.Query("SELECT uid, name, login, role_id, status_id FROM users")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []user.User
	for rows.Next() {
		var u user.User
		if err := rows.Scan(&u.ID, &u.Name, &u.Login, &u.RoleID, &u.StatusID); err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	return users, nil
}

func (r *UserRepository) GetByID(id int64) (*user.User, error) {
	row := r.db.QueryRow("SELECT uid, name, login, role_id, status_id FROM users WHERE uid = ?", id)

	var u user.User
	if err := row.Scan(&u.ID, &u.Name, &u.Login, &u.RoleID, &u.StatusID); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &u, nil
}

func (r *UserRepository) GetByLogin(login string) (*user.User, error) {
	row := r.db.QueryRow("SELECT uid, name, login, role_id, status_id FROM users WHERE login = ?", login)

	var u user.User
	if err := row.Scan(&u.ID, &u.Name, &u.Login, &u.RoleID, &u.StatusID); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &u, nil
}

func (r *UserRepository) Authenticate(login, password string) (*user.User, error) {
	row := r.db.QueryRow(`
			SELECT uid, name, login, role_id, password_hash 
			FROM users 
			WHERE login = ?
			LIMIT 1
	`, login)

	var u user.User
	var hashedPassword string
	err := row.Scan(&u.ID, &u.Name, &u.Login, &u.RoleID, &hashedPassword)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password)); err != nil {
		return nil, nil
	}

	return &u, nil
}

func (r *UserRepository) Register(u user.User) (*user.User, error) {
	// 1. Проверяем, есть ли пользователь с таким логином
	row := r.db.QueryRow(`SELECT uid FROM users WHERE login = ? LIMIT 1`, u.Login)
	var existingID int64
	err := row.Scan(&existingID)

	// Если ошибка не ErrNoRows (то есть не "пользователь не найден"), а что-то другое — вернуть её
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	// Если existingID != 0, значит уже есть пользователь с таким логином
	if err == nil {
		// err == nil => значит row.Scan() прочитал ID => пользователь существует
		return nil, errors.New("user with this login already exists")
	}

	// 2. Хэшируем пароль
	hashedPass, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// 3. Вставляем новую запись
	res, err := r.db.Exec(`
			INSERT INTO users (name, login, password_hash, role_id) 
			VALUES (?, ?, ?, ?)
	`, u.Name, u.Login, string(hashedPass), u.RoleID)
	if err != nil {
		return nil, err
	}

	// 4. Получаем ID вставленной записи
	newID, err := res.LastInsertId()
	if err != nil {
		return nil, err
	}

	return &user.User{
		ID:     newID,
		Name:   u.Name,
		Login:  u.Login,
		RoleID: u.RoleID,
	}, nil
}

func (r *UserRepository) Update(u user.User) (*user.User, error) {
	// Проверяем, что пользователь с данным ID существует
	existingUser, err := r.GetByID(u.ID)
	if err != nil {
		return nil, err
	}
	if existingUser == nil {
		return nil, errors.New("user not found")
	}

	// Проверяем, что новый логин не занят другим пользователем
	userByLogin, err := r.GetByLogin(u.Login)
	if err != nil {
		return nil, err
	}
	if userByLogin != nil && userByLogin.ID != u.ID {
		return nil, errors.New("user with this login already exists")
	}

	if u.Password != "" {
		// Если новый пароль указан, хэшируем его
		hashedPass, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
		if err != nil {
			return nil, err
		}
		// Обновляем данные пользователя с новым паролем
		_, err = r.db.Exec(`
			UPDATE users 
			SET name = ?, login = ?, password_hash = ?, role_id = ? 
			WHERE uid = ?
		`, u.Name, u.Login, string(hashedPass), u.RoleID, u.ID)
		if err != nil {
			return nil, err
		}
	} else {
		// Если пароль не указан, обновляем данные пользователя без изменения поля password_hash
		_, err = r.db.Exec(`
			UPDATE users 
			SET name = ?, login = ?, role_id = ? 
			WHERE uid = ?
		`, u.Name, u.Login, u.RoleID, u.ID)
		if err != nil {
			return nil, err
		}
	}

	return r.GetByID(u.ID)
}

func (r *UserRepository) Delete(u user.User) (*user.User, error) {
	// "Мягко" удаляем пользователя: меняем status_id на 2
	res, err := r.db.Exec("UPDATE users SET status_id = ? WHERE uid = ?", 3, u.ID)
	if err != nil {
		return nil, err
	}

	affected, err := res.RowsAffected()
	if err != nil {
		return nil, err
	}
	if affected == 0 {
		return nil, errors.New("user not found")
	}

	return r.GetByID(u.ID)
}
