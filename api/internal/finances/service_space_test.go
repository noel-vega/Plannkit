package finances_test

import (
	"errors"
	"os"
	"testing"

	"github.com/jmoiron/sqlx"
	"github.com/noel-vega/habits/api/internal/finances"
	"github.com/noel-vega/habits/api/internal/network"
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

type Services struct {
	User     *user.Service
	Network  *network.Service
	Finances *finances.Service
}

func setupService(t *testing.T) *Services {
	t.Helper()
	testutil.TruncateAll(testDB)
	userSvc := user.NewService(testDB)
	networkSvc := network.NewService(testDB, userSvc)
	financesSvc := finances.NewService(testDB, networkSvc)

	return &Services{
		User:     userSvc,
		Network:  networkSvc,
		Finances: financesSvc,
	}
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

func TestServiceCreateSpace(t *testing.T) {
	tests := []struct {
		name      string
		spaceName string
		wantErr   error
	}{
		{
			name:      "require name",
			spaceName: "",
			wantErr:   finances.ErrValidationRequireName,
		},

		{
			name:      "valid",
			spaceName: "My Finances",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			services := setupService(t)
			u := seedUser(t, services.User)
			params := &finances.CreateSpaceParams{
				UserID: u.ID,
				Name:   tt.spaceName,
			}
			space, member, err := services.Finances.CreateSpace(params)
			if tt.wantErr != nil {
				if !errors.Is(err, tt.wantErr) {
					t.Fatalf("error = %v, want %v", err, tt.wantErr)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			if space.Name != tt.spaceName {
				t.Errorf("name = %q, want = %q", space.Name, tt.spaceName)
			}

			if member.Role != finances.RoleOwner {
				t.Errorf("role = %q, want = %q", member.Role, finances.RoleOwner)
			}

			if member.UserID != params.UserID {
				t.Errorf("userID = %d, want = %d", member.UserID, params.UserID)
			}

			if member.Status != finances.MemberInviteAccepted {
				t.Errorf("status = %q, want = %q", member.Status, finances.MemberInviteAccepted)
			}

			if member.SpaceID != space.ID {
				t.Errorf("member spaceID = %d, want = %d", member.SpaceID, space.ID)
			}
		})
	}
}
