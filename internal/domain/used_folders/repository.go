package usedfolders

type Repository interface {
	GetFreeFolder() (string, error)
	MarkFolderAsUsed(userID int, folderName string) error
}
