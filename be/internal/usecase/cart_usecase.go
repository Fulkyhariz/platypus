package usecase

import (
	"context"
	"digital-test-vm/be/internal/dto"
	repo "digital-test-vm/be/internal/repository"
	"fmt"

	"github.com/shopspring/decimal"
)

type cartUsecase struct {
	repo *repo.Repo
}

type CartUsecase interface {
	AddProductToCart(c context.Context, req dto.AddProductToCartRequest, cartId uint64) error
	DeleteProductFromCart(c context.Context, req dto.DeleteProductFromCartRequest, cartId uint64) error
	GetCartDetail(c context.Context, user *dto.UserInfo) (*dto.CartResponse, error)
	AddQuantityInCart(c context.Context, req dto.AddQuantityToCartRequest, userId uint64) error
	DecreasedQuantityToCart(c context.Context, req dto.DecreasedQuantityToCartRequest, userId uint64) error
	SetQuantityToCart(c context.Context, req dto.DecreasedQuantityToCartRequest, userId uint64) error
}

func NewCartUsecase(repo *repo.Repo) CartUsecase {
	return &cartUsecase{
		repo: repo,
	}
}

func (u *cartUsecase) AddProductToCart(c context.Context, req dto.AddProductToCartRequest, cartId uint64) error {
	productVariant, valid := u.repo.VariantRepo.IsVariantCombinationProductIsExists(c, req.VariantCombinationProductId)
	if !valid {
		return fmt.Errorf("cartUsecase/AddProductToCart %w", ErrVariantNotFound)
	}

	if productVariant.Stock < req.Stock {
		return fmt.Errorf("cartUsecase/AddProductToCart %w", ErrProductVariantStock)
	}
	if cart, valid := u.repo.CartRepo.IsProductExistInCart(c, req.VariantCombinationProductId, cartId); valid {
		if productVariant.Stock < (req.Stock + cart.Quantity) {
			return fmt.Errorf("cartUsecase/AddProductToCart %w", ErrProductVariantStock)
		}
		if err := u.repo.CartRepo.AddQuantityToCart(c, req.Stock, cart.ID); err != nil {
			return fmt.Errorf("cartUsecase/AddProductToCart %w", ErrInternalServerError)
		}
		return nil
	}

	if err := u.repo.CartRepo.AddProductToCart(c, req, cartId); err != nil {
		return err
	}

	return nil
}

func (cu *cartUsecase) GetCartDetail(c context.Context, user *dto.UserInfo) (*dto.CartResponse, error) {
	products, err := cu.repo.CartRepo.GetCartDetails(c, user.CartId)
	if err != nil {
		return nil, fmt.Errorf("cartUsecase/GetCartDetail %w", err)
	}
	var total decimal.Decimal
	for _, product := range products {
		price := product.Price
		prodTotal := price.Mul(decimal.NewFromInt(int64(product.Amount)))
		total = total.Add(prodTotal)
	}
	cart := &dto.CartResponse{
		ID:       user.CartId,
		Total:    total.String(),
		Products: dto.CartProductToDTO(products),
	}
	if cart.Products == nil {
		cart.Products = []dto.CartProduct{}
	}
	return cart, nil
}

func (cu *cartUsecase) DeleteProductFromCart(c context.Context, req dto.DeleteProductFromCartRequest, cartId uint64) error {
	if err := cu.repo.CartRepo.IsProductCartExist(c, req.ID, cartId); err != nil {
		return err
	}

	if err := cu.repo.CartRepo.DeleteProductFromCart(c, req.ID, cartId); err != nil {
		return err
	}

	return nil
}

func (u *cartUsecase) AddQuantityInCart(c context.Context, req dto.AddQuantityToCartRequest, userId uint64) error {
	cartProduct, err := u.repo.CartRepo.GetCartProductById(c, req.Id)
	if err != nil {
		return err
	}
	cart, err := u.repo.CartRepo.GetCartById(c, cartProduct.CartId)
	if err != nil {
		return err
	}
	if cart.UserId != userId {
		return fmt.Errorf("cartUsecase/AddQuantityInCart %w", ErrUnauthorizedAccess)
	}

	if err := u.repo.CartRepo.AddQuantityToCart(c, req.Quantity, cartProduct.ID); err != nil {
		return err
	}

	return nil
}

func (u *cartUsecase) DecreasedQuantityToCart(c context.Context, req dto.DecreasedQuantityToCartRequest, userId uint64) error {
	cartProduct, err := u.repo.CartRepo.GetCartProductById(c, req.Id)
	if err != nil {
		return err
	}
	if cartProduct.Quantity < req.Quantity {
		return fmt.Errorf("cartUseCase/DecreasedQuantityToCartRequest %w", ErrDecreasedStock)
	}
	cart, err := u.repo.CartRepo.GetCartById(c, cartProduct.CartId)
	if err != nil {
		return err
	}
	if cart.UserId != userId {
		return fmt.Errorf("cartUsecase/DecreasedQuantityToCart %w", ErrUnauthorizedAccess)
	}

	if err := u.repo.CartRepo.DecreaseQuantityToCart(c, req.Quantity, cartProduct.ID); err != nil {
		return err
	}
	return nil
}

func (u *cartUsecase) SetQuantityToCart(c context.Context, req dto.DecreasedQuantityToCartRequest, userId uint64) error {
	cartProduct, err := u.repo.CartRepo.GetCartProductById(c, req.Id)
	if err != nil {
		return err
	}
	cart, err := u.repo.CartRepo.GetCartById(c, cartProduct.CartId)
	if err != nil {
		return err
	}
	productVariant, valid := u.repo.VariantRepo.IsVariantCombinationProductIsExists(c, cartProduct.VariantCombinationProductId)
	if !valid {
		return fmt.Errorf("cartUsecase/SetQuantityToCart %w", ErrVariantNotFound)
	}
	if productVariant.Stock < req.Quantity {
		return fmt.Errorf("cartUsecase/SetQuantityToCart %w", ErrProductVariantStock)
	}
	if cart.UserId != userId {
		return fmt.Errorf("cartUsecase/SetQuantityToCartRequest %w", ErrUnauthorizedAccess)
	}

	if err := u.repo.CartRepo.SetQuantityToCart(c, req.Quantity, cartProduct.ID); err != nil {
		return err
	}
	return nil
}
