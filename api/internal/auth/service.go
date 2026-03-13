package auth

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

const (
	accessTokenDuration  = 1 * time.Minute
	refreshTokenDuration = (1 * time.Hour) * 24 * 7
)

type Service struct {
	jwtSecret string
}

func NewService(jwtSecret string) *Service {
	return &Service{
		jwtSecret: jwtSecret,
	}
}

func (s *Service) GenerateToken(userID int, duration time.Duration) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userID": userID,
		"exp":    time.Now().Add(duration).Unix(),
		"iat":    time.Now().Unix(),
	})

	tokenStr, err := token.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return "", err
	}
	return tokenStr, nil
}

func (s *Service) GenerateAccessToken(userID int) (string, error) {
	token, err := s.GenerateToken(userID, accessTokenDuration)
	if err != nil {
		return "", err
	}
	return token, nil
}

func (s *Service) GenerateRefreshToken(userID int) (string, error) {
	token, err := s.GenerateToken(userID, refreshTokenDuration)
	if err != nil {
		return "", err
	}
	return token, nil
}

func (s *Service) HashPassword(plainPassword string) (string, error) {
	hashBytes, err := bcrypt.GenerateFromPassword([]byte(plainPassword), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashBytes), nil
}

func (s *Service) ComparePassword(hashedPassword string, plainPassword string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(plainPassword))
}

func (s *Service) GenerateTokenPair(userID int) (*TokenPair, error) {
	accessToken, err := s.GenerateAccessToken(userID)
	if err != nil {
		return nil, err
	}

	refreshToken, err := s.GenerateRefreshToken(userID)
	if err != nil {
		return nil, err
	}

	return &TokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (s *Service) ValidateToken(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(token *jwt.Token) (any, error) {
		return []byte(s.jwtSecret), nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid claims")
	}
	return claims, nil
}

func (s *Service) RefreshAccessToken(refreshToken string) (string, error) {
	claims, err := s.ValidateToken(refreshToken)
	if err != nil {
		return "", err
	}
	token, err := s.GenerateAccessToken(claims.UserID)
	if err != nil {
		return "", err
	}
	return token, nil
}
