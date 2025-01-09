package token

type AccessToken interface {
	Generate(userID string, ttlMinutes int) (string, error)
	Parse(tokenString string) (*AccessClaims, error)
}

type RefreshToken interface {
	Generate(userID string, ttlHours int) (string, error)
	Parse(tokenString string) (*RefreshClaims, error)
	Refresh(oldRefreshToken string, accessService *AccessTokenService, newAccessTTLMinutes, newRefreshTTLHours int) (string, string, error)
	Revoke(tokenString string)
}
