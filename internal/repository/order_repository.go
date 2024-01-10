package repo

import (
	"context"
	"digital-test-vm/be/internal/dto"
	"digital-test-vm/be/internal/model"
	"digital-test-vm/be/internal/shared"
	"fmt"

	"gorm.io/gorm"
)

type orderRepo struct {
	db                *gorm.DB
	transactionRepo   TransactionRepo
	productReviewRepo ProductReviewRepo
}

type OrderRepo interface {
	CheckOrderDetailStatus(c context.Context, orderDetailProductId uint64) (string, error)
	GetListTransactionByOrderId(c context.Context, req dto.ListTransactionRequest, cartId uint64) ([]dto.ListTransaction, error)
	GetListTransactionById(c context.Context, orderId uint64) ([]dto.ListTransaction, error)
	GetPaginationListTransaction(c context.Context, req dto.ListTransactionRequest, cartId uint64) ([]dto.ListOrder, error)
	GetOrderDetailById(c context.Context, orderDetailId uint64) (*model.OrderDetails, uint64, error)
	// GetListTransaction(c context.Context, req dto.ListTransactionRequest, userId uint64) ([]dto.ListTransactionResponse, error)
	ChangeOrderStatus(c context.Context, orderDetailId uint64, status string) error
	GetOrderById(c context.Context, id uint64) (*model.Orders, error)
	GetOrderDetailsProduct(ctx context.Context, orderDetailId, userId uint64) ([]dto.ListTransactionProduct, error)
	GetPaginationInfoTransaction(c context.Context, req dto.ListTransactionRequest, cartId uint64) ([]dto.ListOrder, error)
	DistributeOrder(ctx context.Context, order model.OrderDetails, walletAdmin *string, walletMerchant *string, walletCourier *string) error
	GetBuyerByOrderId(c context.Context, orderDetailId uint64) (*dto.SellerOrderBuyerInformation, error)
	GetListSellerOrderByOrderId(c context.Context, orderDetailId uint64) ([]dto.ListSellerOrder, error)
	GetListSellerOrderId(c context.Context, req dto.ListSellerTransactionRequest, merchantId uint64) ([]dto.ListSellerOrderId, error)
	GetPaginationListSeller(c context.Context, req dto.ListSellerTransactionRequest, merchantId uint64) ([]dto.ListSellerOrderId, error)
	IsOrderDetailExists(c context.Context, orderDetailId uint64) error
	GetAllOrderWithStatusOnDelivery(c context.Context) ([]model.OrderDetails, error)
}

func NewOrderRepo(db *gorm.DB, trx TransactionRepo, productReviewRepo ProductReviewRepo) OrderRepo {
	return &orderRepo{db: db, transactionRepo: trx, productReviewRepo: productReviewRepo}
}

func (r *orderRepo) GetOrderDetailsProduct(ctx context.Context, orderDetailId, userId uint64) ([]dto.ListTransactionProduct, error) {
	var res []dto.ListTransactionProduct
	q := r.db.WithContext(ctx).Raw(`
		SELECT 
			odp.id AS order_detail_product_id,
			vcp.product_id AS product_id,
			odp.name AS product_name,
			vcp.id AS variant_combination_product_id,
			ppo.url AS photo,
			odp.quantity AS quantity,
			odp.price AS product_price
		FROM 
			order_detail_products odp INNER JOIN variant_combination_products vcp ON odp.variant_combination_product_id = vcp.id
			INNER JOIN product_photo_orders ppo ON ppo.order_detail_product_id = odp.id WHERE is_default IS TRUE AND
			odp.order_detail_id = ?
	`, orderDetailId).Order("created_at DESC")
	if err := q.Scan(&res).Error; err != nil {
		return nil, ErrInternalServerError
	}
	for i, v := range res {
		isValid := r.productReviewRepo.IsProductReviewed(ctx, userId, v.ProductId, orderDetailId)
		res[i].IsReviewed = isValid
	}
	return res, nil
}

func (c *orderRepo) DistributeOrder(ctx context.Context, order model.OrderDetails, walletAdmin *string, walletMerchant *string, walletCourier *string) error {

	tx := c.db.WithContext(ctx).Begin()
	defer tx.Rollback()

	desc := fmt.Sprintf("Payment for merchant %d", order.MerchantId)
	transactionOut := &model.Transaction{
		WalletId:    *walletAdmin,
		SenderId:    walletAdmin,
		RecipientId: *walletMerchant,
		Amount:      order.FinalPrice.Neg(),
		Description: &desc,
	}
	err := c.transactionRepo.CreateTransaction(ctx, tx, transactionOut)
	if err != nil {
		return fmt.Errorf("error orderRepo/DistributeOrder: %w", err)
	}
	desc = fmt.Sprintf("Withdraw from order %d", order.Id)
	transactionIn := &model.Transaction{
		WalletId:    *walletMerchant,
		SenderId:    walletAdmin,
		RecipientId: *walletMerchant,
		Amount:      order.FinalPrice,
		Description: &desc,
	}
	err = c.transactionRepo.CreateTransaction(ctx, tx, transactionIn)
	if err != nil {
		return fmt.Errorf("error orderRepo/DistributeOrder: %w", err)
	}
	desc = fmt.Sprintf("Payment for courier %s", order.CourierId)
	transactionCourierOut := &model.Transaction{
		WalletId:    *walletAdmin,
		SenderId:    walletAdmin,
		RecipientId: *walletCourier,
		Amount:      order.CourierPrice.Neg(),
		Description: &desc,
	}
	err = c.transactionRepo.CreateTransaction(ctx, tx, transactionCourierOut)
	if err != nil {
		return fmt.Errorf("error orderRepo/DistributeOrder: %w", err)
	}
	transactionCourierIn := &model.Transaction{
		WalletId:    *walletCourier,
		SenderId:    walletAdmin,
		RecipientId: *walletCourier,
		Amount:      order.FinalPrice,
		Description: &desc,
	}
	err = c.transactionRepo.CreateTransaction(ctx, tx, transactionCourierIn)
	if err != nil {
		return fmt.Errorf("error orderRepo/DistributeOrder: %w", err)
	}
	tx.Commit()
	return nil
}

func (r *orderRepo) CheckOrderDetailStatus(c context.Context, orderDetailId uint64) (string, error) {
	var res dto.OrderStatus
	if err := r.db.WithContext(c).Raw(`select order_status FROM order_details od
	where od.id =?`, orderDetailId).Find(&res).Error; err != nil {
		return "", fmt.Errorf("orderRepo/CheckOrderDetailStatus %w", ErrInternalServerError)
	}
	return res.OrderStatus, nil
}

func (r *orderRepo) GetOrderDetailById(c context.Context, orderDetailId uint64) (*model.OrderDetails, uint64, error) {
	var res *model.OrderDetails
	if err := r.db.WithContext(c).Model(&model.OrderDetails{}).Where("id=?", orderDetailId).First(&res).Error; err != nil {
		return nil, 0, fmt.Errorf("orderRepo/GetOrderDetailById %w", ErrInternalServerError)
	}
	var cartId uint64
	err := r.db.WithContext(c).Table("orders").Select("cart_id").Where("id = ?", res.OrderId).Find(&cartId).Error
	if err != nil {
		return nil, 0, fmt.Errorf("orderRepo/GetOrderDetailById %w", ErrInternalServerError)
	}
	return res, cartId, nil
}

func (r *orderRepo) GetListTransactionByOrderId(c context.Context, req dto.ListTransactionRequest, orderId uint64) ([]dto.ListTransaction, error) {
	var res []dto.ListTransaction
	q := r.db.WithContext(c).Table(`order_details as od`).Select(`od.id AS order_detail_id, courier_id, order_status as status, invoice , merchant_id , address , estimated_time , initial_price , final_price `).Where(`od.order_id=?`, orderId)
	if req.Status != "" {
		q.Where(`od.order_status=?`, req.Status)
	}
	q.Order("od.created_at desc")
	if err := q.Scan(&res).Error; err != nil {
		return nil, ErrInternalServerError
	}

	return res, nil
}

func (r *orderRepo) GetListTransactionById(c context.Context, orderId uint64) ([]dto.ListTransaction, error) {
	var res []dto.ListTransaction
	q := r.db.WithContext(c).Table(`orders as o`).Select(`o.id as order_id, odp.variant_combination_product_id as variant_combination_product_id, od.invoice as invoice, od.courier_id as courier_id, od.merchant_id as merchant_id, od.address as address,
	od.order_status as status, od.estimated_time as estimated_time,  o.final_price as order_price, od.initial_price as initial_price, od.final_price as final_price, odp.final_price as product_price, odp.quantity as quantity`).Joins(`
	inner join order_details od on o.id=od.order_id
	inner join order_detail_products odp on odp.order_detail_id =od.id`).Where(`o.id=?`, orderId).Order(`order_id, merchant_id asc`)
	if err := q.Scan(&res).Error; err != nil {
		return nil, ErrInternalServerError
	}
	return res, nil
}

func (r *orderRepo) GetPaginationInfoTransaction(c context.Context, req dto.ListTransactionRequest, cartId uint64) ([]dto.ListOrder, error) {
	var res []dto.ListOrder
	q := r.db.WithContext(c).Table(`orders as o`).Select(`o.id as order_id, o.final_price`).Where(`o.cart_id=?`, cartId)
	if req.Status != "" {
		q.Where(`od.order_status=?`, req.Status)
	}
	if err := q.Scan(&res).Error; err != nil {
		return nil, ErrInternalServerError
	}
	return res, nil
}

func (r *orderRepo) GetPaginationListTransaction(c context.Context, req dto.ListTransactionRequest, cartId uint64) ([]dto.ListOrder, error) {
	var res []dto.ListOrder
	q := r.db.WithContext(c).Table(`orders as o`).Select(`o.id as order_id, o.final_price as order_price`).Where(`o.cart_id=?`, cartId)
	if req.Status != "" {
		q.Where(`od.order_status=?`, req.Status)
	}
	q.Limit(10).Offset(10 * (int(req.Page) - 1)).Order("o.created_at desc")
	if err := q.Scan(&res).Error; err != nil {
		return nil, ErrInternalServerError
	}
	return res, nil
}

func (r *orderRepo) ChangeOrderStatus(c context.Context, orderDetailId uint64, status string) error {
	if err := r.db.WithContext(c).Model(&model.OrderDetails{}).Where("id=?", orderDetailId).Update("order_status", status).Error; err != nil {
		return fmt.Errorf("orderRepo/ChangeOrderStatus %w", ErrInternalServerError)
	}
	return nil
}

func (r *orderRepo) GetOrderById(c context.Context, id uint64) (*model.Orders, error) {
	var res *model.Orders
	if err := r.db.WithContext(c).Model(&model.Orders{}).Where(`id=?`, id).First(&res).Error; err != nil {
		return nil, fmt.Errorf("orderRepo/GetOrderById %w", ErrOrderNotFound)
	}
	return res, nil
}

func (r *orderRepo) GetBuyerByOrderId(c context.Context, orderDetailId uint64) (*dto.SellerOrderBuyerInformation, error) {
	var res *dto.SellerOrderBuyerInformation
	q := r.db.WithContext(c).Table(`users as u`).Select(`u.id as id, u.username as username`).Joins(`inner join carts c on u.id =c.user_id
	inner join orders o on c.id =o.cart_id 
	inner join order_details od on od.order_id =o.id`).Where(`od.id=?`, orderDetailId)
	if err := q.First(&res).Error; err != nil {
		return nil, fmt.Errorf("orderRepo/GetBuyerByOrderId %w", ErrInternalServerError)
	}
	return res, nil
}

func (r *orderRepo) GetListSellerOrderByOrderId(c context.Context, orderDetailId uint64) ([]dto.ListSellerOrder, error) {
	var res []dto.ListSellerOrder
	q := r.db.WithContext(c).Table(`order_details as od`).Select(`od.id as order_detail_id, od.merchant_id, od.courier_id, od.order_status as status, od.estimated_time, od.address, od.initial_price, od.final_price, od.voucher_id as voucher_id, od.invoice, odp.id as order_detail_product_id, odp.variant_combination_product_id as variant_combination_product_id, quantity, odp.final_price as product_price, ppo.url as url
	`).Joins(`inner join order_detail_products odp on od.id=odp.order_detail_id`).Joins(`inner join product_photo_orders ppo on ppo.order_detail_product_id=odp.id`).Where(`od.id=? and ppo.is_default=?`, orderDetailId, true).Order(`od.id, od.order_id asc`)
	if err := q.Scan(&res).Error; err != nil {
		return nil, fmt.Errorf("orderRepo/GetListSellerOrderByOrderId %w", ErrInternalServerError)
	}
	return res, nil
}

func (r *orderRepo) GetListSellerOrderId(c context.Context, req dto.ListSellerTransactionRequest, merchantId uint64) ([]dto.ListSellerOrderId, error) {
	var res []dto.ListSellerOrderId
	q := r.db.WithContext(c).Table(`order_details as od`).Select(`od.id as order_detail_id`).Joins(`inner join order_detail_products odp on od.id=odp.order_detail_id`).Where(`od.merchant_id=?`, merchantId).Group(`od.id`).Order(`od.id asc`)
	if req.Status != "" {
		q.Where(`od.order_status=?`, req.Status)
	}
	q.Limit(10).Offset(10 * (int(req.Page) - 1))
	if err := q.Scan(&res).Error; err != nil {
		return nil, fmt.Errorf("orderRepo/GetListSellerOrderId %w", ErrInternalServerError)
	}
	return res, nil
}

func (r *orderRepo) GetPaginationListSeller(c context.Context, req dto.ListSellerTransactionRequest, merchantId uint64) ([]dto.ListSellerOrderId, error) {
	var res []dto.ListSellerOrderId
	q := r.db.WithContext(c).Table(`order_details as od`).Select(`od.id as order_detail_id`).Joins(`inner join order_detail_products odp on od.id=odp.order_detail_id`).Where(`od.merchant_id=?`, merchantId).Group(`od.id`).Order(`od.id asc`)
	if req.Status != "" {
		q.Where(`od.order_status=?`, req.Status)
	}
	if err := q.Scan(&res).Error; err != nil {
		return nil, fmt.Errorf("orderRepo/GetListSellerOrderId %w", ErrInternalServerError)
	}
	return res, nil
}

func (r *orderRepo) IsOrderDetailExists(c context.Context, orderDetailId uint64) error {
	var res model.OrderDetails
	if err := r.db.WithContext(c).Model(&model.OrderDetails{}).Where(`id=?`, orderDetailId).First(&res).Error; err != nil {
		return fmt.Errorf("orderRepo/IsOrderDetailExists %w", ErrOrderDetailNotFound)
	}
	return nil
}

func (r *orderRepo) GetAllOrderWithStatusOnDelivery(c context.Context) ([]model.OrderDetails, error) {
	var res []model.OrderDetails
	if err := r.db.WithContext(c).Model(&model.OrderDetails{}).Where("date(estimated_time)=current_date and order_status=?", shared.OnDelivery.String()).Scan(&res).Error; err != nil {
		return nil, fmt.Errorf("orderRepo/GetAllOrderWithStatusOnDelivery")
	}
	return res, nil
}
