package finances_test

import (
	"errors"
	"os"
	"strings"
	"testing"

	"github.com/jmoiron/sqlx"
	"github.com/noel-vega/habits/api/internal/apperrors"
	"github.com/noel-vega/habits/api/internal/finances"
	"github.com/noel-vega/habits/api/internal/network"
	"github.com/noel-vega/habits/api/internal/testutil"
	"github.com/noel-vega/habits/api/internal/user"
)

var testDB *sqlx.DB

type Services struct {
	User     *user.Service
	Network  *network.Service
	Finances *finances.Service
}

func TestMain(m *testing.M) {
	db, cleanup := testutil.SetupTestDB()
	testDB = db
	code := m.Run()
	cleanup()
	os.Exit(code)
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

func seedUser(t *testing.T, svc *user.Service, params user.CreateUserParams) *user.UserNoPassword {
	t.Helper()
	u, err := svc.CreateUser(params)
	if err != nil {
		t.Fatalf("failed to seed user: %v", err)
	}
	return u
}

func seedSpace(t *testing.T, financeService *finances.Service, user *user.UserNoPassword) *finances.Space {
	space, _, err := financeService.CreateSpace(&finances.CreateSpaceParams{
		UserID: user.ID,
		Name:   "Test Space",
	})
	if err != nil {
		t.Fatalf("failed to seed space: %v", err)
	}
	return space
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
			u := seedUser(t, services.User, user.CreateUserParams{
				Username:  "johndoe",
				FirstName: "John",
				LastName:  "Doe",
				Email:     "john@example.com",
				Password:  "hashedpassword123",
			})
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

func TestServiceUpdateSpaceName(t *testing.T) {
	services := setupService(t)
	u := seedUser(t, services.User, user.CreateUserParams{
		Username:  "johndoe",
		FirstName: "John",
		LastName:  "Doe",
		Email:     "john@example.com",
		Password:  "hashedpassword123",
	})
	space := seedSpace(t, services.Finances, u)

	tests := []struct {
		name      string
		spaceName string
		userID    int32
		wantErr   error
	}{
		{name: "valid", spaceName: "Updated Name", userID: u.ID},
		{name: "require name", spaceName: "", userID: u.ID, wantErr: finances.ErrValidationRequireName},
		{name: "no whitespace", spaceName: "  ", userID: u.ID, wantErr: finances.ErrValidationRequireName},
		{name: "no whitespace", spaceName: strings.Repeat("Z", 31), userID: u.ID, wantErr: finances.ErrValidationMaxCharacters},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			params := &finances.UpdateSpaceNameParams{
				SpaceMemberRelationship: finances.SpaceMemberRelationship{
					SpaceID: space.ID,
					UserID:  tt.userID,
				},
				Name: tt.spaceName,
			}

			updatedSpace, err := services.Finances.UpdateSpaceName(params)

			if tt.wantErr != nil {
				if !errors.Is(err, tt.wantErr) {
					t.Fatalf("error = %v, want %v", err, tt.wantErr)
				}
				return
			}

			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			if updatedSpace.Name != tt.spaceName {
				t.Errorf("name = %q, want = %q", updatedSpace.Name, tt.spaceName)
			}
		})
	}
}

func TestServiceUpdateSpaceName_Unauthorized(t *testing.T) {
	services := setupService(t)
	owner := seedUser(t, services.User, user.CreateUserParams{
		Username:  "johndoe",
		FirstName: "John",
		LastName:  "Doe",
		Email:     "john@example.com",
		Password:  "hashedpassword123",
	})
	editor := seedUser(t, services.User, user.CreateUserParams{
		Username:  "janedoe",
		FirstName: "Jane",
		LastName:  "Doe",
		Email:     "jane@example.com",
		Password:  "hashedpassword123",
	})
	space := seedSpace(t, services.Finances, owner)

	_, err := services.Network.RequestConnection(&network.RequestConnectionParams{
		RequestedByUserID: owner.ID,
		TargetUserID:      editor.ID,
	})
	if err != nil {
		t.Fatalf("failed to request connection: %v", err)
	}

	err = services.Network.AcceptConnection(&network.AcceptConnectionParams{
		AcceptedByUserID:  editor.ID,
		RequestedByUserID: owner.ID,
	})
	if err != nil {
		t.Fatalf("failed to accept connection: %v", err)
	}

	_, err = services.Finances.InviteToSpace(&finances.InviteToSpaceParams{
		UserID:          owner.ID,
		NewMemberUserID: editor.ID,
		SpaceID:         space.ID,
		Role:            finances.RoleEditor,
	})
	if err != nil {
		t.Fatalf("failed to invite to space: %v", err)
	}

	tests := []struct {
		name    string
		userID  int32
		errWant error
	}{
		{name: "not owner", userID: editor.ID, errWant: apperrors.ErrUnauthorized},
		{name: "not space member", userID: 999, errWant: apperrors.ErrUnauthorized},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err = services.Finances.UpdateSpaceName(&finances.UpdateSpaceNameParams{
				SpaceMemberRelationship: finances.SpaceMemberRelationship{
					SpaceID: space.ID,
					UserID:  tt.userID,
				},
				Name: "Should Fail",
			})
			if tt.errWant != nil {
				if !errors.Is(err, tt.errWant) {
					t.Fatalf("error = %v, want %v", err, tt.errWant)
				}
				return
			}

			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
		})
	}
}
