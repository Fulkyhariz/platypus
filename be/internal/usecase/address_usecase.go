package usecase

import (
	"context"
	"digital-test-vm/be/internal/dto"
	repo "digital-test-vm/be/internal/repository"
	"digital-test-vm/be/internal/shared"
	utils "digital-test-vm/be/internal/utils"
	"fmt"
)

type addressUsecase struct {
	repo     *repo.Repo
	hashUtil utils.AppHash
}

type AddressUsecase interface {
	EditAddress(ctx context.Context, userId uint64, address *dto.EditAddressRequest) (*dto.Address, error)
	AddAddress(ctx context.Context, userId uint64, address *dto.AddAddressRequest) (*dto.Address, error)
	SetDefault(ctx context.Context, addressId uint64, userId uint64, update shared.AddressToUpdate) error
	FindAddress(ctx context.Context, address *dto.Address) (*dto.Address, error)
	GetAllAddresses(ctx context.Context, userId uint64) ([]dto.Address, error)

	DeleteAddress(ctx context.Context, addressId uint64) error
}

func (a *addressUsecase) DeleteAddress(ctx context.Context, addressId uint64) error {
	err := a.repo.AddressRepo.DeleteAddressById(ctx, addressId)
	if err != nil {
		return fmt.Errorf("addressUsecase/DeleteAddress: %w", err)
	}
	return nil
}

func (a *addressUsecase) GetAllAddresses(ctx context.Context, userId uint64) ([]dto.Address, error) {
	addresses, err := a.repo.AddressRepo.FindAll(ctx, userId)
	if err != nil {
		return nil, fmt.Errorf("addressUsecase/GetAllAddresses: %w", err)
	}
	addressDto := dto.AddressToDTOs(addresses)
	return addressDto, nil
}

func (a *addressUsecase) SetDefault(ctx context.Context, addressId uint64, userId uint64, update shared.AddressToUpdate) error {
	err := a.repo.AddressRepo.UpdateDefault(ctx, userId, addressId, update)
	if err != nil {
		return fmt.Errorf("addressUsecase/SetUserDefault: %w", err)
	}
	return nil
}

func (a *addressUsecase) EditAddress(ctx context.Context, userId uint64, addressReq *dto.EditAddressRequest) (*dto.Address, error) {
	address := &dto.Address{}
	address.ID = addressReq.ID
	address.UserId = userId
	address.PhoneNumber = addressReq.PhoneNumber
	address.Name = addressReq.Name
	address.Province = addressReq.Province
	address.ProvinceCode = addressReq.ProvinceCode
	address.District = addressReq.District
	address.DistrictCode = addressReq.DistrictCode
	address.SubDistrict = addressReq.SubDistrict
	address.SubSubDistrict = addressReq.SubSubDistrict
	address.ZipCode = addressReq.ZipCode
	address.Details = addressReq.Details

	addressModel, err := a.repo.AddressRepo.Update(ctx, address.ToModel())
	if err != nil {
		return nil, fmt.Errorf("addressUsecase/EditAddress: %w", err)
	}
	address = dto.AddressToDTO(addressModel)
	return address, nil
}

func (a *addressUsecase) AddAddress(ctx context.Context, userId uint64, addressReq *dto.AddAddressRequest) (*dto.Address, error) {
	address := &dto.Address{}
	address.UserId = userId
	_, err := a.repo.AddressRepo.FindByUserId(ctx, address.ToModel())
	address.IsDefault = false
	address.IsShopLocation = false
	if err != nil {
		address.IsDefault = true
	}
	address.PhoneNumber = addressReq.PhoneNumber
	address.Name = addressReq.Name
	address.Province = addressReq.Province
	address.ProvinceCode = addressReq.ProvinceCode
	address.District = addressReq.District
	address.DistrictCode = addressReq.DistrictCode
	address.SubDistrict = addressReq.SubDistrict
	address.SubSubDistrict = addressReq.SubSubDistrict
	address.ZipCode = addressReq.ZipCode
	address.Details = addressReq.Details

	addressModel, err := a.repo.AddressRepo.Create(ctx, address.ToModel())
	if err != nil {
		return nil, fmt.Errorf("addressUsecase/AddAddress: %w", err)
	}
	address = dto.AddressToDTO(addressModel)
	return address, nil
}

func (a *addressUsecase) FindAddress(ctx context.Context, address *dto.Address) (*dto.Address, error) {
	addressModel, err := a.repo.AddressRepo.FindByUserId(ctx, address.ToModel())
	if err != nil {
		return nil, fmt.Errorf("addressUsecase/FindAddress: %w", err)
	}
	address = dto.AddressToDTO(addressModel)
	return address, nil
}

func NewAddressUsecase(repo *repo.Repo) AddressUsecase {
	return &addressUsecase{repo: repo, hashUtil: utils.NewAppHash()}
}
