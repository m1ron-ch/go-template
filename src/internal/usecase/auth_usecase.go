package usecase

// // AuthUseCase – объединяет логику пользователей и токенов
// type AuthUseCase struct {
// 	userUC         *UserUseCase
// 	accessService  *token.AccessTokenService
// 	refreshService *token.RefreshTokenService
// }

// func NewAuthUseCase(
// 	userUC *UserUseCase,
// 	accessService *token.AccessTokenService,
// 	refreshService *token.RefreshTokenService,
// ) *AuthUseCase {
// 	return &AuthUseCase{
// 		userUC:         userUC,
// 		accessService:  accessService,
// 		refreshService: refreshService,
// 	}
// }

// // RegisterUser – регистрирует пользователя, возвращает пару токенов (access, refresh).
// func (uc *AuthUseCase) RegisterUser(username, passwordHash string) (string, string, error) {
// 	_, err := uc.userUC.Register(username, passwordHash)
// 	if err != nil {
// 		return "", "", err
// 	}
// 	// Генерируем токены
// 	access, err := uc.accessService.Generate(username, 5) // 5 минут
// 	if err != nil {
// 		return "", "", err
// 	}
// 	refresh, err := uc.refreshService.Generate(username, 24) // 24 часа
// 	if err != nil {
// 		return "", "", err
// 	}
// 	return access, refresh, nil
// }

// // LoginUser – проверяет пользователя (логин) и возвращает токены.
// // В реальном проекте нужно хэшировать пароль и сравнивать с хранящимся хэшем.
// func (uc *AuthUseCase) LoginUser(username, passwordHash string) (string, string, error) {
// 	user, err := uc.userUC.GetUserByUsername(username)
// 	if err != nil {
// 		return "", "", fmt.Errorf("user not found or password mismatch")
// 	}
// 	// Упрощённая проверка пароля (сравниваем хэши как строки)
// 	if user.PasswordHash != passwordHash {
// 		return "", "", fmt.Errorf("invalid password")
// 	}

// 	// Генерируем токены
// 	access, err := uc.accessService.Generate(username, 5)
// 	if err != nil {
// 		return "", "", err
// 	}
// 	refresh, err := uc.refreshService.Generate(username, 24)
// 	if err != nil {
// 		return "", "", err
// 	}
// 	return access, refresh, nil
// }

// // RefreshTokens – обновляет пару токенов по старому refresh-токену
// func (uc *AuthUseCase) RefreshTokens(oldRefresh string) (string, string, error) {
// 	return uc.refreshService.Refresh(oldRefresh, uc.accessService, 5, 24)
// }
