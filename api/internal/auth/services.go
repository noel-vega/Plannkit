package auth

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jmoiron/sqlx"
	"github.com/noel-vega/habits/api/internal/users"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	userService *users.Service
}

func NewService(db *sqlx.DB, userService *users.Service) *Service {
	return &Service{
		userService: userService,
	}
}

func (s *Service) GenerateToken(userID int, duration time.Duration) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(duration).Unix(),
		"iat":     time.Now().Unix(),
	})

	// TODO: secret key
	tokenStr, err := token.SignedString([]byte("secret"))
	if err != nil {
		return "", err
	}
	return tokenStr, nil
}

func (s *Service) GenerateAccessToken(userID int) (string, error) {
	token, err := s.GenerateToken(userID, 1*time.Minute)
	if err != nil {
		return "", err
	}
	return token, nil
}

func (s *Service) GenerateRefreshToken(userID int) (string, error) {
	token, err := s.GenerateToken(userID, 1*time.Hour)
	if err != nil {
		return "", err
	}
	return token, nil
}

func (s *Service) SignUp(params users.CreateUserParams) (*TokenPair, *users.UserNoPassword, error) {
	hashBytes, err := bcrypt.GenerateFromPassword([]byte(params.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, nil, err
	}
	hashedPassword := string(hashBytes)
	params.Password = hashedPassword

	user, err := s.userService.CreateUser(params)
	if err != nil {
		return nil, nil, err
	}

	tokenPair, err := s.GenerateTokenPair(user.ID)
	if err != nil {
		return nil, nil, err
	}

	return tokenPair, user, nil
}

func (s *Service) SignIn(params SignInParams) (*TokenPair, *users.UserNoPassword, error) {
	user, err := s.userService.GetUserByEmailWithPassword(params.Email)
	if err != nil {
		// TODO: check for fatal errors
		return nil, nil, ErrInvalidCredentials
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(params.Password))
	if err != nil {
		return nil, nil, ErrInvalidCredentials
	}
	tokenPair, err := s.GenerateTokenPair(user.ID)
	if err != nil {
		return nil, nil, err
	}

	userNoPassword := &users.UserNoPassword{
		ID:        user.ID,
		FirstName: user.FirstName,
		LastName:  user.LastName,
		Email:     user.Email,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}
	return tokenPair, userNoPassword, nil
}

func (s *Service) GenerateTokenPair(userID int) (*TokenPair, error) {
	accessToken, err := s.GenerateAccessToken(userID)
	if err != nil {
		return nil, err
	}

	refreshToken, err := s.GenerateToken(userID, 1*time.Hour)
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
		return []byte("secret"), nil
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
	fmt.Println("Begin refresh")
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
