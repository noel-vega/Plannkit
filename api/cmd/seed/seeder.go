package main

import (
	"fmt"
	"os"
	"os/exec"

	"github.com/brianvoe/gofakeit/v7"
	"github.com/noel-vega/habits/api/internal/finances"
	"github.com/noel-vega/habits/api/internal/network"
	"github.com/noel-vega/habits/api/internal/server"
	"github.com/noel-vega/habits/api/internal/user"
)

type Seeder struct {
	services *server.Services
	faker    *gofakeit.Faker
}

func NewSeeder(services *server.Services) *Seeder {
	return &Seeder{
		faker:    gofakeit.New(0),
		services: services,
	}
}

func (s *Seeder) ResetDB() error {
	cmd := exec.Command("bash", "./drop.sh")
	cmd.Dir = "../../../db"
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if err := cmd.Run(); err != nil {
		return err
	}

	cmd = exec.Command("bash", "./up.sh")
	cmd.Dir = "../../../db"
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}

func (s *Seeder) SeedUser(num int) *user.UserNoPassword {
	firstName := s.faker.FirstName()
	lastName := s.faker.LastName()
	avatar := fmt.Sprintf("https://api.dicebear.com/9.x/dylan/png?seed=%v", num)
	password, err := s.services.Auth.HashPassword("password")
	if err != nil {
		panic(err)
	}
	username := fmt.Sprintf("%s_%s_%d", firstName, lastName, num)
	u, err := s.services.User.CreateUser(user.CreateUserParams{
		Username:  username,
		FirstName: firstName,
		LastName:  lastName,
		Password:  password,
		Avatar:    &avatar,
		Email:     fmt.Sprintf("%s.%s.%d.test@gmail.com", firstName, lastName, num),
	})
	if err != nil {
		panic(err)
	}

	_, _, err = s.services.Finances.CreateSpace(&finances.CreateSpaceParams{
		UserID: u.ID,
		Name:   "My Finances",
	})
	if err != nil {
		panic(err)
	}

	return u
}

func (s *Seeder) SeedTestUser() *user.UserNoPassword {
	fmt.Println("Seeding test user...")

	password, err := s.services.Auth.HashPassword("password")
	if err != nil {
		panic(err)
	}

	avatar := "https://api.dicebear.com/9.x/dylan/png?seed=testuser"
	u, err := s.services.User.CreateUser(user.CreateUserParams{
		Username:  "testuser",
		FirstName: "Test",
		LastName:  "User",
		Password:  password,
		Email:     "test@test.com",
		Avatar:    &avatar,
	})
	if err != nil {
		panic(err)
	}

	_, _, err = s.services.Finances.CreateSpace(&finances.CreateSpaceParams{
		UserID: u.ID,
		Name:   "My Finances",
	})
	if err != nil {
		panic(err)
	}

	fmt.Println("Test user created — email: test@test.com / password: password")

	return u
}

func (s *Seeder) SeedUsers(count int) []*user.UserNoPassword {
	fmt.Println("Seeding users...")

	users := make([]*user.UserNoPassword, 0, count)
	for i := range count {
		users = append(users, s.SeedUser(i))
	}
	return users
}

func (s *Seeder) SeedConnections(testUser *user.UserNoPassword, users []*user.UserNoPassword, count int) {
	fmt.Printf("Seeding %d connections for test user...\n", count)

	for i := range count {
		if i >= len(users) {
			break
		}

		_, err := s.services.Network.RequestConnection(&network.RequestConnectionParams{
			RequestedByUserID: testUser.ID,
			TargetUserID:      users[i].ID,
		})
		if err != nil {
			panic(err)
		}

		err = s.services.Network.AcceptConnection(&network.AcceptConnectionParams{
			AcceptedByUserID:  users[i].ID,
			RequestedByUserID: testUser.ID,
		})
		if err != nil {
			panic(err)
		}
	}
}
