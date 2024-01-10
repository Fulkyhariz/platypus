package dto

import "digital-test-vm/be/internal/model"

type ManageProductPhoto struct {
	ID        uint64
	URL       string
	IsDefault bool
}

func ModelToManageProductPhoto(productPhoto *model.ProductPhoto) *ManageProductPhoto {
	return &ManageProductPhoto{
		ID:        productPhoto.Id,
		URL:       productPhoto.Url,
		IsDefault: productPhoto.IsDefault,
	}
}

func (mpp *ManageProductPhoto) ToResponse() *ManageProductPhotoResponse {
	return &ManageProductPhotoResponse{
		ID:        mpp.ID,
		URL:       mpp.URL,
		IsDefault: mpp.IsDefault,
	}
}
