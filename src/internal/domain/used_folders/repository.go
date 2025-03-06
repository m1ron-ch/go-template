package usedfolders

type Repository interface {
	GetAll() ([]File, error)
	GetMaxArchiveNumber() (int, error)            // Новый метод
	IsFolderUsed(folderName string) (bool, error) // Можно оставить, если вдруг пригодится
	InsertUsedFolder(userID int, folderName string, leakedID int, archiveNumber int) (int, error)
}
