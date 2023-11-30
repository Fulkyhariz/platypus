package shared

import (
	"os"
)

type Config struct {
	DbHost          string
	DbUser          string
	DbPassword      string
	DbName          string
	DbPort          string
	ApiPort         string
	ApplicationName string
	EnvMode         string
	DbUrl           string
}


func LoadConfig() *Config {
	return &Config{
		DbHost:          os.Getenv("DB_HOST"),
		DbUser:          os.Getenv("DB_USER"),
		DbPassword:      os.Getenv("DB_PASSWORD"),
		DbName:          os.Getenv("DB_NAME"),
		DbPort:          os.Getenv("DB_PORT"),
		ApiPort:         os.Getenv("API_PORT"),
		ApplicationName: os.Getenv("APPLICATION_NAME"),
		EnvMode:         os.Getenv("ENV_MODE"),
		DbUrl:           os.Getenv("DB_URL"),
	}
}
