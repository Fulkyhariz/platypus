package main

import (
	"digital-test-vm/be/internal/database"
	"digital-test-vm/be/internal/server"
	"digital-test-vm/be/internal/shared"
	"log"

	"github.com/joho/godotenv"
)

func main() {
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
		return
	}

	redis := database.InitRedis()

	srv := server.NewServer()
	srv.Start(db, redis)
}
