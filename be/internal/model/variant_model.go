package model

import (
	"time"

	"github.com/shopspring/decimal"
)

type VariantCombinationProduct struct {
	ID                   uint64          `json:"id" gorm:"primarykey"`
	ProductId            uint64          `json:"product_id" binding:"required"`
	VariantCombinationId uint64          `json:"variant_combination_id" binding:"required"`
	Stock                uint64          `json:"stock" binding:"required"`
	Price                decimal.Decimal `json:"price" binding:"required"`
	UpdatedAt            time.Time
}

type VariantCombination struct {
	ID                  uint64 `json:"id" gorm:"primarykey"`
	VariantTypeParentId uint64 `json:"variant_type_parent_id" binding:"required"`
	VariantTypeChildId  uint64 `json:"variant_type_child_id" binding:"required" gorm:"default:null"`
}

type VariantType struct {
	ID             uint64 `json:"id" gorm:"primarykey"`
	VariantGroupId uint64 `json:"variant_group_id" binding:"required"`
	TypeName       string `json:"type_name" binding:"required"`
	VariantImage   string `json:"variant_image" binding:"required" gorm:"default:null"`
}

type VariantGroup struct {
	ID         uint64 `json:"id" gorm:"primarykey"`
	MerchantId uint64 `json:"merchant_id" binding:"required"`
	GroupName  string `json:"group_name" binding:"required"`
}

type VariantDetailResult struct {
	VariantCombinationProductId uint64          `json:"variant_combination_product_id"`
	TypeNameParent              string          `json:"type_name_parent"`
	GroupNameParent             string          `json:"group_name_parent"`
	TypeNameChild               string          `json:"type_name_child"`
	GroupNameChild              string          `json:"group_name_child"`
	Stock                       uint            `json:"stock"`
	Price                       decimal.Decimal `json:"price"`
	VariantImage                string          `json:"variant_image"`
}

type VariantParent struct {
	VariantCombinationProductId uint64          `json:"variant_combination_product_id,omitempty"`
	ParentName                  string          `json:"parent_name"`
	ParentGroup                 string          `json:"parent_group"`
	VariantChild                []VariantChild  `json:"variant_child,omitempty"`
	Price                       decimal.Decimal `json:"price,omitempty" gorm:"type:decimal(64,2);default:null"`
	Stock                       uint            `json:"stock,omitempty"`
	ParentPicture               string          `json:"parent_picture,omitempty"`
}

type VariantChild struct {
	VariantCombinationProductId uint64          `json:"variant_combination_product_id"`
	ChildName                   string          `json:"child_name"`
	ChildGroup                  string          `json:"child_group"`
	Price                       decimal.Decimal `json:"price,omitempty"`
	Stock                       uint            `json:"stock,omitempty"`
}

type VariantCombinationDetailResult struct {
	ID              uint64
	CombinationID   uint64
	ParentGroupID   uint64
	ParentGroupName string
	ParentTypeID    uint64
	ParentTypeName  string
	ParentTypeImage string
	ChildGroupID    uint64
	ChildGroupName  string
	ChildTypeID     uint64
	ChildTypeName   string
	ChildTypeImage  string
	Stock           uint64
	Price           float64
}
