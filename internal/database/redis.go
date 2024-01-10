package database

import (
	"os"

	"github.com/redis/go-redis/v9"
)

func InitRedis() (*redis.Client) {
	client := redis.NewClient(&redis.Options{
		Addr:     os.Getenv("REDIS_HOST"),
		Password: "", // no password set
		DB:       0,  // use default DB
	})
	return client
}
