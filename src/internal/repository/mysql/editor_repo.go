package mysql

import (
	"database/sql"
	"main/internal/domain/editor"
)

type EditorRepository struct {
	db *sql.DB
}

func NewEditorRepository(db *sql.DB) editor.Repository {
	return &EditorRepository{db: db}
}

func (r *EditorRepository) GetContactUs() (*editor.Editor, error) {
	row := r.db.QueryRow("SELECT content, json FROM contact_us LIMIT 1")

	var e editor.Editor
	if err := row.Scan(&e.Content, &e.Json); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &e, nil
}

func (r *EditorRepository) UpdateContactUs(n editor.Editor) error {
	_, err := r.db.Exec("UPDATE contact_us SET content = ?, json = ? LIMIT 1", n.Content, n.Json)
	return err
}

func (r *EditorRepository) GetOrderService() (*editor.Editor, error) {
	row := r.db.QueryRow("SELECT content, json FROM order_service LIMIT 1")

	var e editor.Editor
	if err := row.Scan(&e.Content, &e.Json); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &e, nil
}

func (r *EditorRepository) UpdateOrderService(n editor.Editor) error {
	_, err := r.db.Exec("UPDATE order_service SET content = ?, json = ? LIMIT 1", n.Content, n.Json)
	return err
}

func (r *EditorRepository) GetTermsConditions() (*editor.Editor, error) {
	row := r.db.QueryRow("SELECT content, json FROM terms_and_conditions LIMIT 1")

	var e editor.Editor
	if err := row.Scan(&e.Content, &e.Json); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &e, nil
}

func (r *EditorRepository) UpdateTermsConditions(n editor.Editor) error {
	_, err := r.db.Exec("UPDATE terms_and_conditions SET content = ?, json = ? LIMIT 1", n.Content, n.Json)
	return err
}
