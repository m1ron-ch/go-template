package usecase_test

import (
	"main/internal/entity"
	"main/internal/usecase"
	"testing"
)

type mockUserRepo struct {
	users map[string]*entity.User
}

func (m *mockUserRepo) CreateUser(u *entity.User) (int64, error) {
	if _, ok := m.users[u.Username]; ok {
		return 0, nil
	}
	m.users[u.Username] = u
	return 1, nil
}

func (m *mockUserRepo) GetByUsername(username string) (*entity.User, error) {
	if u, ok := m.users[username]; ok {
		return u, nil
	}
	return nil, nil
}

func TestUserUseCase_Register(t *testing.T) {
	repo := &mockUserRepo{users: make(map[string]*entity.User)}
	uc := usecase.NewUserUseCase(repo)

	_, err := uc.Register("alice", "hash123")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	// Проверим повторную регистрацию
	_, err = uc.Register("alice", "hash456")
	if err == nil {
		t.Fatalf("expected error for existing username, got nil")
	}
}
