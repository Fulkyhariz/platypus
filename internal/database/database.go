package database

import (
	"digital-test-vm/be/internal/shared"
	"log"
	"sync"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var lock = &sync.Mutex{}

var db *gorm.DB

func GetDB(config *shared.Config) (*gorm.DB, error) {
	if db == nil {
		d, err := InitDB(config)
		if err != nil {
			return nil, err
		}
		db = d
	}
	return db, nil
}

func InitDB(config *shared.Config) (*gorm.DB, error) {
	if db == nil {
		lock.Lock()
		defer lock.Unlock()
		if db == nil {
			log.Println("Initialize database now...")
			dsn := config.DbUrl
			singleInstance, err := gorm.Open(postgres.Open(dsn), &gorm.Config{TranslateError: true})
			return singleInstance, err

		} else {
			log.Println("Single instance already created.")
		}
	}
	return db, nil
}
