package dto

import "digital-test-vm/be/internal/model"

type ManageCourier struct {
	ID   uint64
	Name string
}

func ModelToManageCourier(courier *model.Courier) *ManageCourier {
	return &ManageCourier{
		ID:   courier.ID,
		Name: courier.Name,
	}
}

func (mc *ManageCourier) ToResponse() *ManageCourierResponse {
	return &ManageCourierResponse{
		ID:   mc.ID,
		Name: mc.Name,
	}
}
