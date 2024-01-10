package model

type Courier struct {
	ID          uint64
	Name        string
	Description string `gorm:"default:null"`
}
