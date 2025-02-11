package usedfolders

import (
	"main/internal/repository/mysql"
	"os"
	"path/filepath"
	"runtime"
)

type FoldersService interface {
	GetFreeFolder() (string, error)
	MarkFolderAsUsed(userID int, folderName string) (int, error)
}

type foldersService struct {
	usedRepo mysql.UsedFoldersRepo
	// ... возможно, ещё зависимости
}

func NewFoldersService(usedRepo mysql.UsedFoldersRepo) FoldersService {
	return &foldersService{
		usedRepo: usedRepo,
	}
}

// Простой пример: вернуть первую найденную "свободную" папку в /mnt
func (s *foldersService) GetFreeFolder() (string, error) {
	_, b, _, _ := runtime.Caller(0)
	basePath := filepath.Dir(filepath.Dir(filepath.Dir(b)))
	path := "/mnt"
	rootPath := filepath.Join(basePath, path)

	files, err := os.ReadDir(rootPath)
	if err != nil {
		return "", err
	}

	for _, f := range files {
		if f.IsDir() {
			folderPath := filepath.Join(rootPath, f.Name())

			used, err := s.usedRepo.IsFolderUsed(folderPath)
			if err != nil {
				return "", err
			}

			if !used {
				// Это папка свободна
				return folderPath, nil
			}
		}
	}

	// Если ничего не нашли — значит, свободных папок нет
	return "", err
}

func (s *foldersService) MarkFolderAsUsed(userID int, folderName string) (int, error) {
	return s.usedRepo.InsertUsedFolder(int(userID), folderName)
}
