package user_test

import (
	"errors"
	"io"
	"os"
	"strings"
	"testing"

	"github.com/jmoiron/sqlx"
	"github.com/noel-vega/habits/api/internal/apperrors"
	"github.com/noel-vega/habits/api/internal/testutil"
	"github.com/noel-vega/habits/api/internal/user"
)

var testDB *sqlx.DB

func TestMain(m *testing.M) {
	db, cleanup := testutil.SetupTestDB()
	testDB = db
	code := m.Run()
	cleanup()
	os.Exit(code)
}

type fakeStorage struct {
	lastFolder string
	lastExt    string
}

func (f *fakeStorage) Put(folder, ext string, r io.Reader) (string, error) {
	f.lastFolder = folder
	f.lastExt = ext
	return "fake-uuid" + ext, nil
}

func (f *fakeStorage) Get(folder, fileName string) (io.ReadCloser, error) {
	return nil, nil
}

func (f *fakeStorage) Delete(folder, fileName string) error {
	return nil
}

func setupService(t *testing.T) (*user.Service, *fakeStorage) {
	t.Helper()
	testutil.TruncateAll(testDB)
	fs := &fakeStorage{}
	svc := user.NewService(testDB, fs)
	return svc, fs
}

func seedUser(t *testing.T, svc *user.Service) *user.UserNoPassword {
	t.Helper()
	u, err := svc.CreateUser(user.CreateUserParams{
		Username:  "johndoe",
		FirstName: "John",
		LastName:  "Doe",
		Email:     "john@example.com",
		Password:  "hashedpassword123",
	})
	if err != nil {
		t.Fatalf("failed to seed user: %v", err)
	}
	return u
}

func TestServiceCreateUser(t *testing.T) {
	tests := []struct {
		name    string
		params  user.CreateUserParams
		wantErr error
	}{
		{
			name: "valid user",
			params: user.CreateUserParams{
				Username:  "janedoe",
				FirstName: "Jane",
				LastName:  "Doe",
				Email:     "jane@example.com",
				Password:  "hashedpassword123",
			},
		},
		{
			name: "duplicate email",
			params: user.CreateUserParams{
				Username:  "janedoe2",
				FirstName: "Jane",
				LastName:  "Doe",
				Email:     "jane@example.com",
				Password:  "hashedpassword123",
			},
			wantErr: user.ErrEmailExists,
		},
	}

	svc, _ := setupService(t)
	seedUser(t, svc)

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := svc.CreateUser(tt.params)
			if tt.wantErr != nil {
				if !errors.Is(err, tt.wantErr) {
					t.Fatalf("error = %v, want %v", err, tt.wantErr)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if result.Email != tt.params.Email {
				t.Errorf("email = %q, want %q", result.Email, tt.params.Email)
			}
		})
	}
}

func TestServiceGetUserByID(t *testing.T) {
	svc, _ := setupService(t)
	seeded := seedUser(t, svc)

	tests := []struct {
		name    string
		id      int
		wantErr error
	}{
		{name: "existing user", id: seeded.ID},
		{name: "not found", id: 999999, wantErr: apperrors.ErrNotFound},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := svc.GetUserByID(tt.id)
			if tt.wantErr != nil {
				if !errors.Is(err, tt.wantErr) {
					t.Fatalf("error = %v, want %v", err, tt.wantErr)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if result.ID != tt.id {
				t.Errorf("ID = %d, want %d", result.ID, tt.id)
			}
		})
	}
}

func TestServiceGetUserByEmailWithPassword(t *testing.T) {
	svc, _ := setupService(t)
	seedUser(t, svc)

	tests := []struct {
		name    string
		email   string
		wantErr error
	}{
		{name: "existing email", email: "john@example.com"},
		{name: "not found", email: "nobody@example.com", wantErr: apperrors.ErrNotFound},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := svc.GetUserByEmailWithPassword(tt.email)
			if tt.wantErr != nil {
				if !errors.Is(err, tt.wantErr) {
					t.Fatalf("error = %v, want %v", err, tt.wantErr)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if result.Password == "" {
				t.Error("expected password to be populated")
			}
		})
	}
}

func TestServiceGetUserByUsername(t *testing.T) {
	svc, _ := setupService(t)
	seeded := seedUser(t, svc)

	tests := []struct {
		name     string
		username string
		wantErr  error
	}{
		{name: "existing username", username: seeded.Username},
		{name: "not found", username: "nobody", wantErr: apperrors.ErrNotFound},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := svc.GetUserByUsername(tt.username)
			if tt.wantErr != nil {
				if !errors.Is(err, tt.wantErr) {
					t.Fatalf("error = %v, want %v", err, tt.wantErr)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if result.Username != tt.username {
				t.Errorf("username = %q, want %q", result.Username, tt.username)
			}
		})
	}
}

func TestServiceUpdateAvatar(t *testing.T) {
	svc, fs := setupService(t)
	seeded := seedUser(t, svc)

	fileName, err := svc.UpdateAvatar(seeded.ID, ".png", strings.NewReader("fake image data"))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if fileName != "fake-uuid.png" {
		t.Errorf("fileName = %q, want %q", fileName, "fake-uuid.png")
	}
	if fs.lastFolder != "avatars" {
		t.Errorf("storage folder = %q, want %q", fs.lastFolder, "avatars")
	}

	updated, err := svc.GetUserByID(seeded.ID)
	if err != nil {
		t.Fatalf("unexpected error fetching updated user: %v", err)
	}
	if updated.Avatar == nil || *updated.Avatar != "fake-uuid.png" {
		t.Errorf("avatar = %v, want %q", updated.Avatar, "fake-uuid.png")
	}
}
