package mysql

import (
	"database/sql"
	usedfolders "main/internal/domain/used_folders"
)

type UsedFoldersRepo interface {
	GetAll() ([]usedfolders.File, error)
	IsFolderUsed(folderName string) (bool, error)
	InsertUsedFolder(userID int, folderName string) (int, error)
	// Опционально: метод для освобождения папки, если понадобится
	// DeleteUsedFolder(folderName string) error
}

type usedFoldersRepository struct {
	db *sql.DB
}

func NewUsedFoldersRepoPG(db *sql.DB) usedfolders.Repository {
	return &usedFoldersRepository{db: db}
}

func (r *usedFoldersRepository) GetAll() ([]usedfolders.File, error) {
	rows, err := r.db.Query(`SELECT f.id, f.folder_name, f.archive_number, f.status, f.created_at, u.login, l.company_name, l.website
		FROM used_folders f
		INNER JOIN users u ON u.uid = f.user_id
		INNER JOIN leaked l ON l.id = f.leaked_id
		ORDER BY f.id DESC;`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var files []usedfolders.File
	for rows.Next() {
		var f usedfolders.File
		if err := rows.Scan(&f.ID, &f.FolderName, &f.ArchiveNumber, &f.Status, &f.CreatedAt, &f.User.Login, &f.Leaked.CompanyName, &f.Leaked.Website); err != nil {
			return nil, err
		}

		files = append(files, f)
	}

	return files, nil
}

// Проверка: занята ли папка (есть ли в used_folders запись с таким именем)
func (r *usedFoldersRepository) IsFolderUsed(folderName string) (bool, error) {
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

func (r *usedFoldersRepository) GetMaxArchiveNumber() (int, error) {
	var maxNum sql.NullInt64
	err := r.db.QueryRow(`SELECT COALESCE(MAX(archive_number), 0) FROM used_folders`).Scan(&maxNum)
	if err == sql.ErrNoRows {
		return 0, nil
	}
	if err != nil {
		return 0, err
	}
	if !maxNum.Valid {
		return 0, nil
	}
	return int(maxNum.Int64), nil
}

// Добавление новой записи о «занятой» папке
func (r *usedFoldersRepository) InsertUsedFolder(userID int, folderName string, leakedID int, archiveNumber int) (int, error) {
	query := `
        INSERT INTO used_folders (user_id, folder_name, leaked_id, archive_number) 
        VALUES (?, ?, ?, ?)
    `
	result, err := r.db.Exec(query, userID, folderName, leakedID, archiveNumber)
	if err != nil {
		return 0, err
	}
	lastID, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}
	return int(lastID), nil
}

// Опционально:
// func (r *usedFoldersRepoPG) DeleteUsedFolder(folderName string) error {
//     _, err := r.db.Exec(`DELETE FROM used_folders WHERE folder_name = $1`, folderName)
//     return err
// }
