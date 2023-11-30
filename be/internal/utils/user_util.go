package utils

import (
	"digital-test-vm/be/internal/auth"
	"digital-test-vm/be/internal/database"
	"digital-test-vm/be/internal/dto"
	repo "digital-test-vm/be/internal/repository"
	"digital-test-vm/be/internal/shared"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func GetUserFromContext(c *gin.Context) (*dto.UserInfo, error) {
	claims, ok := c.Get("claims")
	if !ok {
		return nil, shared.ErrClaimsNotFound
	}
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	env := shared.LoadConfig()
	if env == nil {
		log.Fatal("Error loading config")
	}

	db, err := database.GetDB(env)
	if err != nil {
		return nil, err
	}
	repo := repo.NewUserRepo(db, nil, nil)
	user, err := repo.FindUserInfo(c, claims.(*auth.JWTClaim).User.ID)
	if err != nil {
		return nil, err
	}

	return user, nil
}
