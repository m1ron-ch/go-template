package usedfolders

import (
	"fmt"
)

type Service interface {
	GetAll() ([]File, error)
	GetFreeFolder() (string, int, error) // Хотим вернуть и имя, и число
	MarkFolderAsUsed(userID int, folderName string, leakedID, archiveNumber int) (int, error)
}

type service struct {
	repo Repository
}

func NewFoldersService(r Repository) Service {
	return &service{repo: r}
}

func (s *service) GetAll() ([]File, error) {
	return s.repo.GetAll()
}

// Вместо чтения /mnt:
func (s *service) GetFreeFolder() (string, int, error) {
	lastNum, err := s.repo.GetMaxArchiveNumber()
	if err != nil {
		return "", 0, err
	}
	nextNum := lastNum + 1
	folderName := fmt.Sprintf("archive_%d", nextNum)
	return folderName, nextNum, nil
}

func (s *service) MarkFolderAsUsed(userID int, folderName string, leakedID, archiveNumber int) (int, error) {
	return s.repo.InsertUsedFolder(userID, folderName, leakedID, archiveNumber)
}
