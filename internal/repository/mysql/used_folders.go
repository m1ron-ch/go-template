package mysql

import (
	"database/sql"
	"errors"
)

type UsedFoldersRepo interface {
	IsFolderUsed(folderName string) (bool, error)
	InsertUsedFolder(userID int, folderName string) (int, error)
	// Опционально: метод для освобождения папки, если понадобится
	// DeleteUsedFolder(folderName string) error
}

type usedFoldersRepoPG struct {
	db *sql.DB
}

func NewUsedFoldersRepoPG(db *sql.DB) UsedFoldersRepo {
	return &usedFoldersRepoPG{db: db}
}

// Проверка: занята ли папка (есть ли в used_folders запись с таким именем)
func (r *usedFoldersRepoPG) IsFolderUsed(folderName string) (bool, error) {
	var count int
	err := r.db.QueryRow(`
        SELECT COUNT(*) 
        FROM used_folders 
        WHERE folder_name = ?
    `, folderName).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// Добавление новой записи о «занятой» папке
func (r *usedFoldersRepoPG) InsertUsedFolder(userID int, folderName string) (int, error) {
	used, err := r.IsFolderUsed(folderName)
	if err != nil {
		return 0, err
	}
	if used {
		return 0, errors.New("folder already used")
	}

	var insertedID int
	query := `
        INSERT INTO used_folders (user_id, folder_name)
        VALUES ($1, $2)
        RETURNING id
    `
	err = r.db.QueryRow(query, userID, folderName).Scan(&insertedID)
	if err != nil {
		return 0, err
	}
	return insertedID, nil
}

// Опционально:
// func (r *usedFoldersRepoPG) DeleteUsedFolder(folderName string) error {
//     _, err := r.db.Exec(`DELETE FROM used_folders WHERE folder_name = $1`, folderName)
//     return err
// }
