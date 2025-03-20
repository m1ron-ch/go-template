package token

import (
	"sync"
	"time"
)

type RefreshTokenStore interface {
	Save(token string, expiresAt time.Time)
	Exists(token string) bool
	Delete(token string)
}

type InMemoryRefreshStore struct {
	mu         sync.Mutex
	tokenStore map[string]time.Time
}

func NewInMemoryRefreshStore() *InMemoryRefreshStore {
	return &InMemoryRefreshStore{
		tokenStore: make(map[string]time.Time),
	}
}

func (s *InMemoryRefreshStore) Save(token string, expiresAt time.Time) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.tokenStore[token] = expiresAt
}

func (s *InMemoryRefreshStore) Exists(token string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	exp, ok := s.tokenStore[token]
	if !ok {
		return false
	}
	if time.Now().After(exp) {
		delete(s.tokenStore, token)
		return false
	}
	return true
}

func (s *InMemoryRefreshStore) Delete(token string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.tokenStore, token)
}
