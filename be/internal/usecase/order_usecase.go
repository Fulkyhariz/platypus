package usecase

import (
	"context"
	"digital-test-vm/be/internal/dto"
	repo "digital-test-vm/be/internal/repository"
	"digital-test-vm/be/internal/shared"
	"fmt"
)

type orderUsecase struct {
	repo *repo.Repo
}

type OrderUsecase interface {
	GetListTransaction(c context.Context, req dto.ListTransactionRequest, cartId, userId uint64) ([]dto.ListTransactionResponse, error)
	GetPaginationListTransaction(c context.Context, req dto.ListTransactionRequest, cartId uint64) (*dto.PaginationInfo, error)
	ChangeOrderStatusToProcessed(c context.Context, orderDetailId uint64, merchantsId uint64) error
	ChangeOrderStatusToOnDelivery(c context.Context, orderDetailId uint64, merchantsId uint64) error
	ChangeOrderStatusToDelivered(c context.Context, orderDetailId uint64) error
	ChangeOrderStatusToCompleted(c context.Context, orderDetailId uint64, userCart uint64) error
	ChangeOrderStatusToReviewed(c context.Context, orderDetailId uint64, userCart uint64) error
	GetOrderDetail(c context.Context, id, cartId uint64) (*dto.ListTransactionResponse, error)
	GetListSellerOrder(c context.Context, req dto.ListSellerTransactionRequest, merchantId uint64) ([]dto.ListSellerOrderResponse, error)
	GetPaginationListSellerOrder(c context.Context, req dto.ListSellerTransactionRequest, merchantId uint64) (*dto.PaginationInfo, error)
	GetSellerOrderDetail(c context.Context, orderDetailId, merchantId uint64) (*dto.ListSellerOrderResponse, error)
}

func NewOrderUsecase(repo *repo.Repo) OrderUsecase {
	return &orderUsecase{
		repo: repo,
	}
}

func (u *orderUsecase) GetListTransaction(c context.Context, req dto.ListTransactionRequest, cartId, userId uint64) ([]dto.ListTransactionResponse, error) {
	var res []dto.ListTransactionResponse
	orders, err := u.repo.OrderRepo.GetPaginationListTransaction(c, req, cartId)
	if err != nil {
		return nil, err
	}
	if len(orders) == 0 {
		return nil, fmt.Errorf("orderUsecase/GetListTransaction %w", ErrListTransactionNotFound)
	}

	for _, v := range orders {
		listTransaction, err := u.repo.OrderRepo.GetListTransactionByOrderId(c, req, v.OrderId)
		if err != nil {
			return nil, err
		}
		var order dto.ListTransactionResponse
		order.OrderId = v.OrderId
		order.OrderPrice = v.OrderPrice
		var listTransactionOrder []dto.ListTransactionOrder

		for _, v := range listTransaction {
			merchants, err := u.repo.MerchantRepo.FindMerchantByID(c, v.MerchantId)
			if err != nil {
				return nil, fmt.Errorf("orderUsecase/GetListTransaction %w", ErrInternalServerError)
			}
			orderDetails := dto.ListTransactionOrder{
				OrderDetailId: v.OrderDetailId,
				CourierId:     v.CourierId,
				Invoice:       v.Invoice,
				MerchantId:    v.MerchantId,
				MerchantName:  merchants.Name,
				Address:       v.Address,
				EstimatedTime: v.EstimatedTime,
				InitialPrice:  v.InitialPrice,
				FinalPrice:    v.FinalPrice,
				Status:        v.Status,
			}
			product, err := u.repo.OrderRepo.GetOrderDetailsProduct(c, v.OrderDetailId, userId)
			if err != nil {
				return nil, fmt.Errorf("orderUsecase/GetListTransaction %w", ErrInternalServerError)
			}
			orderDetails.ListTransactionProduct = product
			listTransactionOrder = append(listTransactionOrder, orderDetails)
		}
		order.ListTransactionOrder = listTransactionOrder
		res = append(res, order)
	}
	return res, nil
}

func (u *orderUsecase) GetPaginationListTransaction(c context.Context, req dto.ListTransactionRequest, cartId uint64) (*dto.PaginationInfo, error) {
	res, err := u.repo.OrderRepo.GetPaginationInfoTransaction(c, req, cartId)
	if err != nil {
		return nil, err
	}
	length := len(res)
	return &dto.PaginationInfo{TotalItems: int64(length), TotalPages: (int64(length) + int64(10) - 1) / int64(10), CurrentPage: int64(req.Page)}, nil
}

func (u *orderUsecase) ChangeOrderStatusToProcessed(c context.Context, orderDetailId uint64, merchantsId uint64) error {
	orderDetail, _, err := u.repo.OrderRepo.GetOrderDetailById(c, orderDetailId)
	if err != nil {
		return err
	}

	if orderDetail.OrderStatus != shared.WaitingForSeller.String() {
		return fmt.Errorf("orderUsecase/ChangeOrderStatusToProcessed %w", ErrUnauthorizedAccess)
	}

	if orderDetail.MerchantId != merchantsId {
		return fmt.Errorf("orderUsecase/ChangeOrderStatusToProcessed %w", ErrUnauthorizedAccess)
	}
	if err := u.repo.OrderRepo.ChangeOrderStatus(c, orderDetailId, shared.Processed.String()); err != nil {
		return err
	}
	return nil
}

func (u *orderUsecase) ChangeOrderStatusToOnDelivery(c context.Context, orderDetailId uint64, merchantsId uint64) error {
	orderDetail, _, err := u.repo.OrderRepo.GetOrderDetailById(c, orderDetailId)
	if err != nil {
		return err
	}

	if orderDetail.OrderStatus != shared.Processed.String() {
		return fmt.Errorf("orderUsecase/ChangeOrderStatusToOnDelivery %w", ErrUnauthorizedAccess)
	}

	if orderDetail.MerchantId != merchantsId {
		return fmt.Errorf("orderUsecase/ChangeOrderStatusToProcessed %w", ErrUnauthorizedAccess)
	}
	if err := u.repo.OrderRepo.ChangeOrderStatus(c, orderDetailId, shared.OnDelivery.String()); err != nil {
		return err
	}
	return nil
}

func (u *orderUsecase) ChangeOrderStatusToDelivered(c context.Context, orderDetailId uint64) error {
	orderDetail, _, err := u.repo.OrderRepo.GetOrderDetailById(c, orderDetailId)
	if err != nil {
		return err
	}

	if orderDetail.OrderStatus != shared.OnDelivery.String() {
		return fmt.Errorf("orderUsecase/ChangeOrderStatusToDelivered %w", ErrUnauthorizedAccess)
	}

	if err := u.repo.OrderRepo.ChangeOrderStatus(c, orderDetailId, shared.Delivered.String()); err != nil {
		return err
	}
	return nil
}

func (u *orderUsecase) ChangeOrderStatusToCompleted(c context.Context, orderDetailId uint64, userCart uint64) error {
	orderDetail, cartId, err := u.repo.OrderRepo.GetOrderDetailById(c, orderDetailId)
	if err != nil {
		return fmt.Errorf("orderUsecase/ChangeOrderStatusToCompleted %w", err)
	}

	if cartId != userCart {
		return fmt.Errorf("orderUsecase/ChangeOrderStatusToCompleted %w", ErrUnauthorizedAccess)
	}

	if orderDetail.OrderStatus != shared.Delivered.String() {
		return fmt.Errorf("orderUsecase/ChangeOrderStatusToCompleted %w", ErrUnauthorizedAccess)
	}

	merchant, err := u.repo.MerchantRepo.GetMerchantId(c, int(orderDetail.MerchantId))
	if err != nil {
		return fmt.Errorf("orderUsecase/ChangeOrderStatusToCompleted %w", err)
	}

	merchantWallet, err := u.repo.WalletRepo.FindByUserId(c, merchant.UserID)
	if err != nil {
		return fmt.Errorf("orderUsecase/ChangeOrderStatusToCompleted %w", err)
	}

	courierWallet, err := u.repo.WalletRepo.FindByUserId(c, shared.ADMIN_COURIER[orderDetail.CourierId])
	if err != nil {
		return fmt.Errorf("orderUsecase/ChangeOrderStatusToCompleted %w", err)
	}

	adminWallet, err := u.repo.WalletRepo.FindByUserId(c, shared.ADMIN_WALLET)
	if err != nil {
		return fmt.Errorf("orderUsecase/ChangeOrderStatusToCompleted %w", err)
	}

	err = u.repo.OrderRepo.DistributeOrder(c, *orderDetail, &adminWallet.WalletId, &merchantWallet.WalletId, &courierWallet.WalletId)
	if err != nil {
		return fmt.Errorf("orderUsecase/ChangeOrderStatusToCompleted %w", err)
	}

	if err := u.repo.OrderRepo.ChangeOrderStatus(c, orderDetailId, shared.Completed.String()); err != nil {
		return err
	}
	return nil
}

func (u *orderUsecase) ChangeOrderStatusToReviewed(c context.Context, orderDetailId uint64, userCart uint64) error {
	orderDetail, cartId, err := u.repo.OrderRepo.GetOrderDetailById(c, orderDetailId)
	if err != nil {
		return fmt.Errorf("orderUsecase/ChangeOrderStatusToReviewed %w", err)
	}

	if cartId != userCart {
		return fmt.Errorf("orderUsecase/ChangeOrderStatusToReviewed %w", ErrUnauthorizedAccess)
	}

	if orderDetail.OrderStatus != shared.Completed.String() {
		return fmt.Errorf("orderUsecase/ChangeOrderStatusToReviewed %w", ErrUnauthorizedAccess)
	}

	if err := u.repo.OrderRepo.ChangeOrderStatus(c, orderDetailId, shared.Reviewed.String()); err != nil {
		return err
	}
	return nil
}

func (u *orderUsecase) GetOrderDetail(c context.Context, id, cartId uint64) (*dto.ListTransactionResponse, error) {
	order, err := u.repo.OrderRepo.GetOrderById(c, id)
	if err != nil {
		return nil, err
	}
	if order.CartId != cartId {
		return nil, fmt.Errorf("orderUsecase/GetOrderDetail %w", ErrUnauthorizedAccess)
	}
	orderDetail, err := u.repo.OrderRepo.GetListTransactionById(c, id)
	if err != nil {
		return nil, err
	}
	if len(orderDetail) == 0 {
		return nil, fmt.Errorf("orderUsecase/GetOrderDetail %w", ErrOrderNotFound)
	}
	merchants, err := u.repo.MerchantRepo.FindMerchantByID(c, orderDetail[0].MerchantId)
	if err != nil {
		return nil, fmt.Errorf("orderUsecase/GetListTransaction %w", ErrInternalServerError)
	}
	listTransactionOrder := []dto.ListTransactionOrder{}
	var listTransactionProduct []dto.ListTransactionProduct
	currentMerchantId := orderDetail[0].MerchantId
	index := 0
	for i, v := range orderDetail {
		if i == 0 {
			listTransactionOrder = append(listTransactionOrder, dto.ListTransactionOrder{CourierId: orderDetail[0].CourierId, Invoice: orderDetail[0].Invoice, MerchantId: orderDetail[0].MerchantId, MerchantName: merchants.Name, Address: orderDetail[0].Address, EstimatedTime: orderDetail[0].EstimatedTime, InitialPrice: orderDetail[0].InitialPrice, FinalPrice: orderDetail[0].FinalPrice})
		}
		product, err := u.repo.ProductRepo.GetProductByVariantCombinationProductId(c, v.VariantCombinationProductId)
		if err != nil {
			return nil, fmt.Errorf("orderUsecase/GetListTransaction %w", ErrInternalServerError)
		}
		productPhoto, err := u.repo.ProductPhotoRepo.GetDefaultProductPhotoByProductId(c, product.ID)
		if err != nil {
			return nil, fmt.Errorf("orderUsecase/GetListTransaction %w", ErrInternalServerError)
		}
		if currentMerchantId != v.MerchantId {
			listTransactionOrder = append(listTransactionOrder, dto.ListTransactionOrder{CourierId: v.CourierId, Invoice: v.Invoice, MerchantId: v.MerchantId, MerchantName: merchants.Name, Address: v.Address, EstimatedTime: v.EstimatedTime, InitialPrice: v.InitialPrice, FinalPrice: v.FinalPrice})
			index++
			currentMerchantId = v.MerchantId
			listTransactionProduct = nil
		}
		listTransactionProduct = append(listTransactionProduct, dto.ListTransactionProduct{ProductId: product.ID, ProductName: product.Title, VariantCombinationProductId: v.VariantCombinationProductId, Photo: productPhoto.Url, Status: v.Status, Quantity: v.Quantity, ProductPrice: v.ProductPrice})
		listTransactionOrder[index].ListTransactionProduct = listTransactionProduct
	}

	return &dto.ListTransactionResponse{
		OrderId:              orderDetail[0].OrderId,
		OrderPrice:           orderDetail[0].OrderPrice,
		ListTransactionOrder: listTransactionOrder,
	}, nil
}

func (u *orderUsecase) GetListSellerOrder(c context.Context, req dto.ListSellerTransactionRequest, merchantId uint64) ([]dto.ListSellerOrderResponse, error) {
	var res []dto.ListSellerOrderResponse
	listOrderDetailId, err := u.repo.OrderRepo.GetListSellerOrderId(c, req, merchantId)
	if err != nil {
		return nil, err
	}
	for _, orderDetailId := range listOrderDetailId {
		var listSellerOrder dto.ListSellerOrderResponse
		var listProduct []dto.ListSellerTransactionProduct
		listOrders, err := u.repo.OrderRepo.GetListSellerOrderByOrderId(c, orderDetailId.OrderDetailId)
		if err != nil {
			return nil, fmt.Errorf("orderUsecase/GetListTransaction %w", ErrInternalServerError)
		}
		user, err := u.repo.OrderRepo.GetBuyerByOrderId(c, orderDetailId.OrderDetailId)
		if err != nil {
			return nil, fmt.Errorf("orderUsecase/GetListTransaction %w", ErrInternalServerError)
		}
		listSellerOrder.OrderDetailId = listOrders[0].OrderDetailId
		listSellerOrder.EstimatedTime = listOrders[0].EstimatedTime
		listSellerOrder.InitialPrice = listOrders[0].InitialPrice
		listSellerOrder.FinalPrice = listOrders[0].FinalPrice
		listSellerOrder.CourierId = listOrders[0].CourierId
		listSellerOrder.Address = listOrders[0].Address
		listSellerOrder.Invoice = listOrders[0].Invoice
		listSellerOrder.UserId = user.Id
		listSellerOrder.Username = user.Username
		listSellerOrder.Status = listOrders[0].Status

		for _, orders := range listOrders {
			product, err := u.repo.ProductRepo.GetProductByVariantCombinationProductId(c, orders.VariantCombinationProductId)
			if err != nil {
				return nil, fmt.Errorf("orderUsecase/GetListTransaction %w", ErrInternalServerError)
			}
			listProduct = append(listProduct, dto.ListSellerTransactionProduct{ProductId: product.ID, ProductName: product.Title, VariantCombinationProductId: orders.VariantCombinationProductId, Photo: orders.Url, Quantity: orders.Quantity, ProductPrice: orders.ProductPrice})
		}
		listSellerOrder.ListSellerTransactionProduct = listProduct
		res = append(res, listSellerOrder)
	}
	return res, nil
}

func (u *orderUsecase) GetPaginationListSellerOrder(c context.Context, req dto.ListSellerTransactionRequest, merchantId uint64) (*dto.PaginationInfo, error) {
	res, err := u.repo.OrderRepo.GetPaginationListSeller(c, req, merchantId)
	if err != nil {
		return nil, err
	}
	length := len(res)
	return &dto.PaginationInfo{TotalItems: int64(length), TotalPages: (int64(length) + int64(10) - 1) / int64(10), CurrentPage: int64(req.Page)}, nil
}

func (u *orderUsecase) GetSellerOrderDetail(c context.Context, orderDetailId, merchantId uint64) (*dto.ListSellerOrderResponse, error) {
	var listProduct []dto.ListSellerTransactionProduct
	listOrders, err := u.repo.OrderRepo.GetListSellerOrderByOrderId(c, orderDetailId)
	if err != nil {
		return nil, fmt.Errorf("orderUsecase/GetSellerOrderDetail %w", ErrInternalServerError)
	}
	if len(listOrders) == 0 {
		return nil, fmt.Errorf("orderUsecase/GetSellerOrderDetail %w", ErrOrderNotFound)
	}
	if listOrders[0].MerchantId != merchantId {
		return nil, fmt.Errorf("orderUsecase/GetSellerOrderDetail %w", ErrUnauthorizedAccess)
	}
	user, err := u.repo.OrderRepo.GetBuyerByOrderId(c, orderDetailId)
	if err != nil {
		return nil, fmt.Errorf("orderUsecase/GetSellerOrderDetail %w", ErrInternalServerError)
	}

	for _, orders := range listOrders {
		product, err := u.repo.ProductRepo.GetProductByVariantCombinationProductId(c, orders.VariantCombinationProductId)
		if err != nil {
			return nil, fmt.Errorf("orderUsecase/GetSellerOrderDetail %w", ErrInternalServerError)
		}
		listProduct = append(listProduct, dto.ListSellerTransactionProduct{ProductId: product.ID, ProductName: product.Title, VariantCombinationProductId: orders.VariantCombinationProductId, Photo: orders.Url, Quantity: orders.Quantity, ProductPrice: orders.ProductPrice})
	}
	return &dto.ListSellerOrderResponse{
		OrderDetailId:                listOrders[0].OrderDetailId,
		EstimatedTime:                listOrders[0].EstimatedTime,
		InitialPrice:                 listOrders[0].InitialPrice,
		FinalPrice:                   listOrders[0].FinalPrice,
		CourierId:                    listOrders[0].CourierId,
		Address:                      listOrders[0].Address,
		Invoice:                      listOrders[0].Invoice,
		UserId:                       user.Id,
		Username:                     user.Username,
		Status:                       listOrders[0].Status,
		ListSellerTransactionProduct: listProduct,
	}, nil
}
