package usecase

import (
	"context"
	"digital-test-vm/be/internal/dto"
	"digital-test-vm/be/internal/model"
	repo "digital-test-vm/be/internal/repository"
	"digital-test-vm/be/internal/shared"
	"fmt"
	"time"

	"github.com/shopspring/decimal"
)

type checkoutUsecase struct {
	repo *repo.Repo
}

type CheckoutUsecase interface {
	CheckoutCart(ctx context.Context, req dto.CheckoutRequest, user dto.UserInfo) error
	CheckPrice(ctx context.Context, req dto.CheckoutRequest, user dto.UserInfo) (dto.CheckPriceResponse, error)
	GetAvailablePromo(ctx context.Context, user dto.UserInfo) ([]dto.PromoResponse, error)
}

func NewCheckoutUsecase(repo *repo.Repo) CheckoutUsecase {
	return &checkoutUsecase{
		repo: repo,
	}
}

func (c *checkoutUsecase) CheckPrice(ctx context.Context, req dto.CheckoutRequest, user dto.UserInfo) (dto.CheckPriceResponse, error) {

	productMerchantMap, err := c.repo.CheckoutRepo.GetCheckoutDetails(ctx, user.CartId)
	if err != nil {
		return dto.CheckPriceResponse{}, fmt.Errorf("checkoutUsecase/CheckPrice : %w", err)
	}

	if len(productMerchantMap) == 0 {
		return dto.CheckPriceResponse{}, ErrCartEmpty
	}

	address, err := c.extractAddress(ctx, req.AddressId, user)
	if err != nil {
		return dto.CheckPriceResponse{}, fmt.Errorf("checkoutUsecase/CheckPrice : %w", err)
	}

	orders := &dto.Orders{
		CartId:    user.CartId,
		OrderDate: time.Now(),
		User:      user,
	}
	if req.VoucherId != nil {
		orders.VoucherId = req.VoucherId
	}
	for _, merchant := range req.Merchant {
		orderDetails := c.extractOrderDetails(merchant, orders)
		orderDetails.Address = address
		courierPrice, _ := decimal.NewFromString(merchant.CourierPrice)
		orderDetails.CourierPrice = courierPrice

		for _, checkoutProduct := range productMerchantMap[merchant.MerchantId] {
			product := c.extractOrderDetailProduct(checkoutProduct)
			product.MerchantId = merchant.MerchantId
			orderDetails.OrderDetailProducts = append(orderDetails.OrderDetailProducts, product)
		}
		orders.OrderDetails = append(orders.OrderDetails, orderDetails)
	}

	_, check, err := c.calculateFinalPrice(ctx, orders)
	if err != nil {
		return dto.CheckPriceResponse{}, fmt.Errorf("checkoutUsecase/CheckPrice : %w", err)
	}

	return check, nil
}

func (c *checkoutUsecase) GetAvailablePromo(ctx context.Context, user dto.UserInfo) ([]dto.PromoResponse, error) {
	var merchantIds []uint64
	var productIds []uint64
	cart, err := c.repo.CheckoutRepo.GetCheckoutDetails(ctx, user.CartId)
	if err != nil {
		return []dto.PromoResponse{}, fmt.Errorf("checkoutUsecase/GetAvailablePromo : %w", err)
	}
	for merchantId, merchant := range cart {
		merchantIds = append(merchantIds, merchantId)
		for _, product := range merchant {
			productIds = append(productIds, product.ProductID)
		}
	}
	promos, err := c.repo.CheckoutRepo.GetPromotion(ctx, merchantIds, productIds)
	if err != nil {
		return []dto.PromoResponse{}, fmt.Errorf("checkoutUsecase/GetAvailablePromo : %w", err)
	}
	promosResponse := []dto.PromoResponse{}
	for _, promo := range promos {
		promosResponse = append(promosResponse, dto.PromoResponse{
			Id:   promo.Id,
			Name: promo.Name,
		})
	}
	return promosResponse, nil
}

func (c *checkoutUsecase) CheckoutCart(ctx context.Context, req dto.CheckoutRequest, user dto.UserInfo) error {
	photos := make(map[uint64][]model.Photos)

	productMerchantMap, err := c.repo.CheckoutRepo.GetCheckoutDetails(ctx, user.CartId)
	if err != nil {
		return fmt.Errorf("checkoutUsecase/CheckoutCart : %w", err)
	}

	if len(productMerchantMap) == 0 {
		return ErrCartEmpty
	}

	address, err := c.extractAddress(ctx, req.AddressId, user)
	if err != nil {
		return fmt.Errorf("checkoutUsecase/CheckoutCart : %w", err)
	}

	orders := &dto.Orders{
		CartId:    user.CartId,
		OrderDate: time.Now(),
		User:      user,
	}
	if req.VoucherId != nil {
		orders.VoucherId = req.VoucherId
	}
	for _, merchant := range req.Merchant {
		orderDetails := c.extractOrderDetails(merchant, orders)
		orderDetails.Address = address
		courierPrice, _ := decimal.NewFromString(merchant.CourierPrice)
		orderDetails.CourierPrice = courierPrice

		for _, checkoutProduct := range productMerchantMap[merchant.MerchantId] {
			photos[checkoutProduct.ProductID] = checkoutProduct.Photos
			product := c.extractOrderDetailProduct(checkoutProduct)
			product.MerchantId = merchant.MerchantId
			orderDetails.OrderDetailProducts = append(orderDetails.OrderDetailProducts, product)
		}
		orders.OrderDetails = append(orders.OrderDetails, orderDetails)
	}

	orders, _, err = c.calculateFinalPrice(ctx, orders)
	if err != nil {
		return fmt.Errorf("checkoutUsecase/CheckoutCart : %w", err)
	}

	wallet, err := c.repo.WalletRepo.FindByUserId(ctx, user.ID)
	if err != nil {
		return fmt.Errorf("checkoutUsecase/CheckoutCart : %w", err)
	}

	if wallet.Balance.LessThanOrEqual(orders.FinalPrice) {
		return fmt.Errorf("checkoutUsecase/CheckoutCart : %w", ErrInsufficientBalance)
	}

	err = c.repo.CheckoutRepo.CreateOrder(ctx, orders, photos)
	if err != nil {
		return fmt.Errorf("checkoutUsecase/CheckoutCart : %w", err)
	}

	err = c.repo.CartRepo.ClearCart(ctx, user.CartId)
	if err != nil {
		return fmt.Errorf("checkoutUsecase/CheckoutCart : %w", err)
	}

	return nil
}

func (c *checkoutUsecase) calculateFinalPrice(ctx context.Context, order *dto.Orders) (*dto.Orders, dto.CheckPriceResponse, error) {
	check := dto.CheckPriceResponse{}

	for j, orderDetail := range order.OrderDetails {
		check.CheckPriceMerchants = append(check.CheckPriceMerchants, dto.CheckPriceMerchant{})
		for i, orderDetailProduct := range orderDetail.OrderDetailProducts {
			check.CheckPriceMerchants[j].CheckPriceProducts = append(check.CheckPriceMerchants[j].CheckPriceProducts, dto.CheckPriceProduct{})
			amount := decimal.NewFromInt(int64(orderDetailProduct.Quantity))
			orderDetailProduct.InitialPrice = orderDetailProduct.Price.Mul(amount)
			orderDetailProduct.FinalPrice = orderDetailProduct.InitialPrice
			orderDetail.OrderDetailProducts[i] = orderDetailProduct
			orderDetail.InitialPrice = orderDetail.InitialPrice.Add(orderDetailProduct.InitialPrice)
			check.CheckPriceMerchants[j].CheckPriceProducts[i].TotalPrice = orderDetailProduct.FinalPrice.String()
			check.CheckPriceMerchants[j].CheckPriceProducts[i].ProductId = orderDetailProduct.ProductId
			check.CheckPriceMerchants[j].CheckPriceProducts[i].ProductName = orderDetailProduct.Name
		}
		// orderDetail.InitialPrice = order.InitialPrice.Add(orderDetail.InitialPrice)
		orderDetail.FinalPrice = orderDetail.InitialPrice
		order.InitialPrice = order.InitialPrice.Add(orderDetail.InitialPrice).Add(orderDetail.CourierPrice)
		order.OrderDetails[j] = orderDetail
		check.CheckPriceMerchants[j].TotalPrice = orderDetail.FinalPrice.String()
		check.CheckPriceMerchants[j].Ongkir = orderDetail.CourierPrice.String()
		check.CheckPriceMerchants[j].MerchantId = orderDetail.MerchantId
	}
	order.FinalPrice = order.InitialPrice
	check.TotalPrice = order.FinalPrice.String()
	if order.VoucherId == nil {
		return order, check, nil
	}

	voucher, err := c.repo.CheckoutRepo.GetPromotionDetail(ctx, *order.VoucherId)
	if err != nil {
		return nil, dto.CheckPriceResponse{}, fmt.Errorf("checkoutUsecase/calculateFinalPrice : %w", err)
	}

	err = c.verifyVoucher(voucher)

	if err != nil {
		return nil, dto.CheckPriceResponse{}, fmt.Errorf("checkoutUsecase/calculateFinalPrice : %w", err)
	}

	check, order, _ = c.applyVoucher(voucher, order, check)

	return order, check, nil
}

func (c *checkoutUsecase) verifyVoucher(voucher *model.PromotionProduct) error {
	if voucher.StartDate.After(time.Now()) {
		return ErrInvalidVoucher
	}
	if voucher.EndDate.Before(time.Now()) {
		return ErrInvalidVoucher
	}
	zero := uint64(0)
	if voucher.Quota == zero {
		return ErrInvalidVoucher
	}

	return nil
}

func (c *checkoutUsecase) applyGlobalVoucher(voucher *model.PromotionProduct, order *dto.Orders, check dto.CheckPriceResponse) (dto.CheckPriceResponse, *dto.Orders, error) {
	order.FinalPrice = decimal.Zero
	promo := decimal.NewFromFloat(voucher.Amount)
	if voucher.PromotionType == shared.Discount.String() {
		discount := order.InitialPrice.Mul(promo)
		maxDiscount := decimal.NewFromFloat(*voucher.MaxAmount)
		if discount.GreaterThan(maxDiscount) {
			discount = maxDiscount
		}
		order.FinalPrice = order.InitialPrice.Add(discount.Neg())
		check.TotalPrice = order.FinalPrice.String()
		check.CuttedPrice = order.FinalPrice.String()
		check.InitialPrice = order.InitialPrice.String()
		check.Discount = promo.String()
	}
	if voucher.PromotionType == shared.Cut.String() {
		if promo.GreaterThan(order.InitialPrice) {
			return dto.CheckPriceResponse{}, nil, ErrInvalidVoucher
		}
		order.FinalPrice = order.InitialPrice.Add(promo.Neg())
		check.TotalPrice = order.FinalPrice.String()
		check.CuttedPrice = order.FinalPrice.String()
		check.InitialPrice = order.InitialPrice.String()
		check.CutPrice = promo.Neg().String()
	}
	return check, order, nil
}

func (c *checkoutUsecase) applyMerchantVoucher(voucher *model.PromotionProduct, order *dto.Orders, check dto.CheckPriceResponse) (dto.CheckPriceResponse, *dto.Orders, error) {
	promo := decimal.NewFromFloat(voucher.Amount)
	order.FinalPrice = decimal.Zero
	for i, merchant := range order.OrderDetails {
		order.OrderDetails[i].FinalPrice = decimal.Zero
		merchant.FinalPrice = decimal.Zero
		if merchant.MerchantId != *voucher.MerchantId {
			merchant.FinalPrice = merchant.InitialPrice
			order.FinalPrice = order.FinalPrice.Add(merchant.FinalPrice).Add(merchant.CourierPrice)
			check.TotalPrice = order.FinalPrice.String()
			order.OrderDetails[i].FinalPrice = merchant.FinalPrice
			continue
		}
		if voucher.PromotionType == shared.Discount.String() {
			discount := merchant.InitialPrice.Mul(promo)
			maxDiscount := decimal.NewFromFloat(*voucher.MaxAmount)
			if discount.GreaterThan(maxDiscount) {
				discount = maxDiscount
			}
			merchant.FinalPrice = merchant.InitialPrice.Add(discount.Neg())
			check.CheckPriceMerchants[i].TotalPrice = merchant.FinalPrice.String()
			check.CheckPriceMerchants[i].CuttedPrice = merchant.FinalPrice.String()
			check.CheckPriceMerchants[i].InitialPrice = merchant.InitialPrice.String()
			check.CheckPriceMerchants[i].Discount = promo.String()
		}
		if voucher.PromotionType == shared.Cut.String() {
			if promo.GreaterThan(merchant.InitialPrice) {
				return dto.CheckPriceResponse{}, nil, ErrInvalidVoucher
			}
			merchant.FinalPrice = merchant.InitialPrice.Add(promo.Neg())
			check.CheckPriceMerchants[i].TotalPrice = merchant.FinalPrice.String()
			check.CheckPriceMerchants[i].CuttedPrice = merchant.FinalPrice.String()
			check.CheckPriceMerchants[i].InitialPrice = merchant.InitialPrice.String()
			check.CheckPriceMerchants[i].CutPrice = promo.Neg().String()
		}
		order.FinalPrice = order.FinalPrice.Add(merchant.FinalPrice).Add(merchant.CourierPrice)
		check.TotalPrice = order.FinalPrice.String()
		order.OrderDetails[i].FinalPrice = merchant.FinalPrice
	}
	return check, order, nil
}

func (c *checkoutUsecase) applyProductVoucher(voucher *model.PromotionProduct, order *dto.Orders, check dto.CheckPriceResponse) (dto.CheckPriceResponse, *dto.Orders, error) {
	order.FinalPrice = decimal.Zero
	promo := decimal.NewFromFloat(voucher.Amount)
	for i, merchant := range order.OrderDetails {
		order.OrderDetails[i].FinalPrice = decimal.Zero
		merchant.FinalPrice = decimal.Zero
		for j, product := range merchant.OrderDetailProducts {
			order.OrderDetails[i].OrderDetailProducts[j].FinalPrice = decimal.Zero
			product.FinalPrice = decimal.Zero
			if product.ProductId != *voucher.ProductId {
				product.FinalPrice = product.InitialPrice
				merchant.FinalPrice = merchant.FinalPrice.Add(product.FinalPrice)
				order.OrderDetails[i].OrderDetailProducts[j].FinalPrice = product.FinalPrice
				continue
			}
			if voucher.PromotionType == shared.Discount.String() {
				discount := product.InitialPrice.Mul(promo)
				maxDiscount := decimal.NewFromFloat(*voucher.MaxAmount)
				if discount.GreaterThan(maxDiscount) {
					discount = maxDiscount
				}
				product.FinalPrice = product.InitialPrice.Add(discount.Neg())
				check.CheckPriceMerchants[i].CheckPriceProducts[j].TotalPrice = product.FinalPrice.String()
				check.CheckPriceMerchants[i].CheckPriceProducts[j].CuttedPrice = product.FinalPrice.String()
				check.CheckPriceMerchants[i].CheckPriceProducts[j].InitialPrice = product.InitialPrice.String()
				check.CheckPriceMerchants[i].CheckPriceProducts[j].Discount = promo.String()
			}
			if voucher.PromotionType == shared.Cut.String() {
				if promo.GreaterThan(product.InitialPrice) {
					return dto.CheckPriceResponse{}, nil, ErrInvalidVoucher
				}
				product.FinalPrice = product.InitialPrice.Add(promo.Neg())
				check.CheckPriceMerchants[i].CheckPriceProducts[j].TotalPrice = product.FinalPrice.String()
				check.CheckPriceMerchants[i].CheckPriceProducts[j].CuttedPrice = product.FinalPrice.String()
				check.CheckPriceMerchants[i].CheckPriceProducts[j].InitialPrice = product.InitialPrice.String()
				check.CheckPriceMerchants[i].CheckPriceProducts[j].CutPrice = promo.Neg().String()
			}
			merchant.FinalPrice = merchant.FinalPrice.Add(product.FinalPrice)
			check.CheckPriceMerchants[i].TotalPrice = merchant.FinalPrice.String()
			order.OrderDetails[i].OrderDetailProducts[j].FinalPrice = product.FinalPrice
		}
		order.OrderDetails[i].FinalPrice = merchant.FinalPrice
		order.FinalPrice = order.FinalPrice.Add(merchant.FinalPrice).Add(merchant.CourierPrice)
		check.TotalPrice = order.FinalPrice.String()
	}
	return check, order, nil
}

func (c *checkoutUsecase) applyVoucher(voucher *model.PromotionProduct, order *dto.Orders, check dto.CheckPriceResponse) (dto.CheckPriceResponse, *dto.Orders, error) {
	var err error
	if voucher.PromotionScope == shared.GlobalScope.String() {
		check, order, err = c.applyGlobalVoucher(voucher, order, check)
	}

	if voucher.PromotionScope == shared.MerchantScope.String() {
		check, order, err = c.applyMerchantVoucher(voucher, order, check)
	}

	if voucher.PromotionScope == shared.ProductScope.String() {
		check, order, err = c.applyProductVoucher(voucher, order, check)
	}

	return check, order, err
}

func (c *checkoutUsecase) extractOrderDetailProduct(checkoutProduct model.CheckoutProduct) dto.OrderDetailProducts {
	return dto.OrderDetailProducts{
		VariantCombinationProductId: checkoutProduct.VariantCombinationProductID,
		ProductId:                   checkoutProduct.ProductID,
		Quantity:                    checkoutProduct.Amount,
		Price:                       checkoutProduct.Price,
		Name:                        checkoutProduct.Title,
		Description:                 checkoutProduct.Description,
	}
}

func (c *checkoutUsecase) extractOrderDetails(merchant dto.MerchantCheckoutRequest, orders *dto.Orders) dto.OrderDetails {
	return dto.OrderDetails{
		MerchantId:    merchant.MerchantId,
		CourierId:     merchant.CourierId,
		OrderStatus:   shared.WaitingForSeller.String(),
		EstimatedTime: time.Now().Add(7 * 24 * time.Hour),
		Invoice: fmt.Sprintf("%02d%02d%04d%04d%06d",
			orders.OrderDate.Day(),
			orders.OrderDate.Month(),
			orders.OrderDate.Year(),
			merchant.MerchantId,
			orders.CartId,
		),
	}
}

func (c *checkoutUsecase) extractAddress(ctx context.Context, addressId uint64, user dto.UserInfo) (string, error) {
	address := &model.Address{ID: addressId}
	address, err := c.repo.AddressRepo.FindById(ctx, address)
	if err != nil {
		return "", fmt.Errorf("checkoutUsecase/extractAddress : %w", err)
	}
	if address.UserId != user.ID {
		return "", fmt.Errorf("checkoutUsecase/extractAddress : %w", ErrInvalidAddress)
	}
	addresString := fmt.Sprintf("%s [Note: %s] %s %s %s %s %d",
		address.Details,
		address.Name,
		address.SubSubDistrict,
		address.SubDistrict,
		address.District,
		address.Province,
		address.ZipCode,
	)
	return addresString, nil
}
