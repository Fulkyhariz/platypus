package dto

import "github.com/shopspring/decimal"

type ManageVariantGroup struct {
	ID    uint64
	Group string
	Types []ManageVariantType
}

func (mvg *ManageVariantGroup) ToResponse() *ManageVariantGroupResponse {
	types := []ManageVariantTypeResponse{}
	for _, t := range mvg.Types {
		types = append(types, *t.ToResponse())
	}

	return &ManageVariantGroupResponse{
		ID:    mvg.ID,
		Group: mvg.Group,
		Types: types,
	}
}

type ManageVariant struct {
	Parent       ManageVariantGroup
	Child        *ManageVariantGroup
	Combinations []ManageVariantCombination
}

func (mv *ManageVariant) ToResponse() *ManageVariantResponse {
	combinations := []ManageVariantCombinationResponse{}
	for _, c := range mv.Combinations {
		combinations = append(combinations, *c.ToResponse())
	}
	mvr := &ManageVariantResponse{
		Parent:       *mv.Parent.ToResponse(),
		Combinations: combinations,
	}
	if mv.Child != nil {
		mvr.Child = mv.Child.ToResponse()
	}
	return mvr
}

type ManageVariantType struct {
	ID    uint64
	Type  string
	Image string
}

func (mvt *ManageVariantType) ToResponse() *ManageVariantTypeResponse {
	return &ManageVariantTypeResponse{
		ID:    mvt.ID,
		Type:  mvt.Type,
		Image: mvt.Image,
	}
}

type ManageVariantCombination struct {
	ID         uint64
	ParentType ManageVariantType
	ChildType  *ManageVariantType
	Price      decimal.Decimal
	Stock      uint64
}

func (mvc *ManageVariantCombination) ToResponse() *ManageVariantCombinationResponse {
	mvcr := &ManageVariantCombinationResponse{
		ID:         mvc.ID,
		ParentType: *mvc.ParentType.ToResponse(),
		Price:      mvc.Price.String(),
		Stock:      mvc.Stock,
	}
	if mvc.ChildType != nil {
		mvcr.ChildType = mvc.ChildType.ToResponse()
	}
	return mvcr
}
