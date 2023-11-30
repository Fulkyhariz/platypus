package repo

import (
	"context"
	"digital-test-vm/be/internal/dto"
	"digital-test-vm/be/internal/model"
	"digital-test-vm/be/internal/shared"
	"encoding/json"
	"fmt"
	"time"

	"gorm.io/gorm"
)

type checkoutRepo struct {
	db              *gorm.DB
	transactionRepo TransactionRepo
	walletRepo      WalletRepo
}

type CheckoutRepo interface {
	CreateOrder(ctx context.Context, checkoutRequest *dto.Orders, photo map[uint64][]model.Photos) error
	GetCheckoutDetails(c context.Context, cartId uint64) (map[uint64][]model.CheckoutProduct, error)
	GetPromotionDetail(c context.Context, promoId uint64) (*model.PromotionProduct, error)
	GetPromotion(ctx context.Context, merchantIds []uint64, productIds []uint64) ([]model.PromoName, error)
}

func NewCheckoutRepo(db *gorm.DB, trx TransactionRepo, w WalletRepo) CheckoutRepo {
	return &checkoutRepo{db: db, transactionRepo: trx, walletRepo: w}
}

func (cr *checkoutRepo) GetPromotion(ctx context.Context, merchantIds []uint64, productIds []uint64) ([]model.PromoName, error) {
	var promoNames []model.PromoName

	err := cr.db.Raw(`
	SELECT p.id AS promotion_id, p.promo_name AS promo_name FROM promotions p 
	LEFT JOIN merchant_product_promotions mpp ON p.id  = mpp.promotion_id 
	WHERE start_date < NOW() AND end_date > now() 
	AND ((mpp.product_id in ? OR (mpp.merchant_id in ? AND mpp.product_id IS NULL)) OR 
	(mpp.product_id IS NULL AND mpp.merchant_id IS NULL AND promotion_scope = 'GLOBAL'))`, productIds, merchantIds).
		Scan(&promoNames).Error

	if err != nil {
		return []model.PromoName{}, fmt.Errorf("checkoutRepo/GetCheckoutDetails %w", err)
	}
	return promoNames, nil
}

func (cr *checkoutRepo) GetPromotionDetail(c context.Context, promoId uint64) (*model.PromotionProduct, error) {
	var promotionDetail model.PromotionProduct

	err := cr.db.WithContext(c).Raw(`SELECT 
	p.id AS id,
	mpp.merchant_id AS merchant_id,
	mpp.product_id AS product_id,
	p.promotion_type AS promotion_type,
	p.promotion_scope AS promotion_scope,
	p.amount AS amount,
	p.start_date AS start_date,
	p.end_date AS end_date,
	p.quota AS quota,
	p.max_amount AS max_amount
FROM 
	promotions p LEFT JOIN merchant_product_promotions mpp 
	ON p.id = mpp.promotion_id WHERE p.id = ?;`, promoId).First(&promotionDetail).Error
	if err != nil {
		return nil, fmt.Errorf("checkoutRepo/GetPromotionDetail %w", err)
	}
	return &promotionDetail, nil
}

func (cr *checkoutRepo) GetCheckoutDetails(c context.Context, cartId uint64) (map[uint64][]model.CheckoutProduct, error) {
	checkoutMap := make(map[uint64][]model.CheckoutProduct)
	checkoutProduct := []model.CheckoutProduct{}
	err := cr.db.WithContext(c).Raw(`SELECT 
	cp.id AS cart_product_id,
	vcp.product_id  AS product_id,
	p.merchant_id AS merchant_id,
	p.weight AS weight,
	vcp.id AS variant_combination_product_id,
	p.title AS title,
	p.description AS description,
	cp.quantity AS amount,
	vtp.type_name AS variant_parrent,
	vtc.type_name AS variant_child,
	vcp.price AS price,
	vcp.stock AS stock	
FROM 
	cart_products cp INNER JOIN variant_combination_products vcp ON cp.variant_combination_product_id = vcp.id
	INNER JOIN products p ON vcp.product_id = p.id 
	LEFT JOIN variant_combinations vc ON vc.id = vcp.variant_combination_id 
	LEFT JOIN variant_types vtp ON vc.variant_type_parent_id = vtp.id 
	LEFT JOIN variant_types vtc ON vc.variant_type_child_id = vtc.id
	WHERE cart_id = ? AND cp.deleted_at IS NULL;`, cartId).Scan(&checkoutProduct).Error

	if err != nil {
		return nil, fmt.Errorf("checkoutRepo/GetCheckoutDetails %w", err)
	}

	for _, product := range checkoutProduct {
		image := []model.Photos{}
		err := cr.db.WithContext(c).Raw(`SELECT url, is_default 
		FROM product_photos pp
		WHERE pp.product_id = ?;`, product.ProductID).Scan(&image).Error
		if err != nil {
			return nil, fmt.Errorf("checkoutRepo/GetCheckoutDetails %w", err)
		}
		product.Photos = image
		checkoutMap[product.MerchantID] = append(checkoutMap[product.MerchantID], product)
	}

	return checkoutMap, nil
}

func (c *checkoutRepo) CreateOrder(ctx context.Context, orderDto *dto.Orders, photos map[uint64][]model.Photos) error {
	var orderModel model.Orders
	var orderDetailModel model.OrderDetails
	var orderDetailProductModel model.OrderDetailProducts

	tx := c.db.WithContext(ctx).Begin()
	defer tx.Rollback()

	orderModel = c.extractOrder(orderDto)
	err := tx.Create(&orderModel).Error
	if err != nil {
		return fmt.Errorf("checkoutRepo/CreateOrder : %w", err)
	}
	for _, orderDetail := range orderDto.OrderDetails {
		orderDetail.OrderId = orderModel.Id
		orderDetailModel = c.extractOrderDetail(orderDetail)
		err := tx.Create(&orderDetailModel).Error
		if err != nil {
			return fmt.Errorf("checkoutRepo/CreateOrder : %w", err)
		}
		for _, orderDetailProduct := range orderDetail.OrderDetailProducts {
			orderDetailProduct.OrderDetailId = orderDetailModel.Id
			orderDetailProductModel = c.extractOrderDetailProduct(orderDetailProduct)
			err := tx.Create(&orderDetailProductModel).Error
			if err != nil {
				return fmt.Errorf("checkoutRepo/CreateOrder : %w", err)
			}
			c.decreaseProductStock(tx, orderDetailProductModel.VariantCombinationProductId, orderDetailProductModel.Quantity)
			if err != nil {
				return fmt.Errorf("checkoutRepo/CreateOrder : %w", err)
			}
			err = c.createProductPhotosOrder(tx, orderDetailProductModel.Id, photos[orderDetailProduct.ProductId])
			if err != nil {
				return fmt.Errorf("checkoutRepo/CreateOrder : %w", err)
			}
		}
		err = c.createPayment(ctx, tx, orderDetailModel, orderDto.User.WalletId)
		if err != nil {
			return fmt.Errorf("checkoutRepo/CreateOrder : %w", err)
		}
	}
	tx.Commit()
	return nil
}

func (cr *checkoutRepo) decreaseProductStock(tx *gorm.DB, variantCombinationId uint64, stock uint64) error {
	err := tx.Table("variant_combination_products").Where("id = ?", variantCombinationId).Update("stock", gorm.Expr("stock - ?", stock)).Error
	if err != nil {
		return fmt.Errorf("checkoutRepo/decreaseProductStock : %w", err)
	}
	return nil
}

func (cr *checkoutRepo) createProductPhotosOrder(tx *gorm.DB, orderId uint64, photos []model.Photos) error {
	for _, pp := range photos {
		mpp := model.ProductPhotoOrder{
			OrderDetailProductId: orderId,
			Url:                  pp.Url,
			IsDefault:            pp.IsDefault,
		}
		err := tx.Table("product_photo_orders").Create(&mpp).Error
		if err != nil {
			return err
		}
	}
	return nil
}

// TO DO PAYMENT KIRIM KE JNE BELUM BENER
func (c *checkoutRepo) createPayment(ctx context.Context, tx *gorm.DB, order model.OrderDetails, walletID *string) error {
	walletModel, err := c.walletRepo.FindByUserId(ctx, shared.ADMIN_WALLET)
	if err != nil {
		return fmt.Errorf("error checkoutRepo/createPayment: %w", err)
	}
	desc := fmt.Sprintf("Payment for order %d", order.Id)
	transactionOut := &model.Transaction{
		WalletId:    *walletID,
		SenderId:    walletID,
		RecipientId: walletModel.WalletId,
		Amount:      order.FinalPrice.Neg(),
		Description: &desc,
	}
	payment := &model.Payment{
		OrderDetailId: order.Id,
		PaymentDate:   time.Now(),
	}
	err = c.transactionRepo.CreatePayment(ctx, tx, transactionOut, payment)
	if err != nil {
		return fmt.Errorf("error checkoutRepo/createPayment: %w", err)
	}
	transactionIn := &model.Transaction{
		WalletId:    walletModel.WalletId,
		SenderId:    walletID,
		RecipientId: walletModel.WalletId,
		Amount:      order.FinalPrice,
		Description: &desc,
	}
	err = c.transactionRepo.CreateTransaction(ctx, tx, transactionIn)
	if err != nil {
		return fmt.Errorf("error checkoutRepo/createPayment: %w", err)
	}
	desc = fmt.Sprintf("Payment for courier %s", order.CourierId)
	transactionCourierOut := &model.Transaction{
		WalletId:    *walletID,
		SenderId:    walletID,
		RecipientId: walletModel.WalletId,
		Amount:      order.CourierPrice.Neg(),
		Description: &desc,
	}
	err = c.transactionRepo.CreateTransaction(ctx, tx, transactionCourierOut)
	if err != nil {
		return fmt.Errorf("error checkoutRepo/createPayment: %w", err)
	}
	transactionCourierIn := &model.Transaction{
		WalletId:    walletModel.WalletId,
		SenderId:    walletID,
		RecipientId: walletModel.WalletId,
		Amount:      order.CourierPrice.Neg(),
		Description: &desc,
	}
	err = c.transactionRepo.CreateTransaction(ctx, tx, transactionCourierIn)
	if err != nil {
		return fmt.Errorf("error checkoutRepo/createPayment: %w", err)
	}
	return nil
}

func (c *checkoutRepo) extractOrder(orderDto *dto.Orders) model.Orders {
	return model.Orders{
		CartId:       orderDto.CartId,
		FinalPrice:   orderDto.FinalPrice,
		InitialPrice: orderDto.InitialPrice,
		OrderDate:    orderDto.OrderDate,
		VoucherId:    orderDto.VoucherId,
	}
}

func (c *checkoutRepo) extractOrderDetail(orderDto dto.OrderDetails) model.OrderDetails {
	return model.OrderDetails{
		OrderId:       orderDto.OrderId,
		MerchantId:    orderDto.MerchantId,
		CourierId:     orderDto.CourierId,
		OrderStatus:   orderDto.OrderStatus,
		EstimatedTime: orderDto.EstimatedTime,
		Address:       orderDto.Address,
		InitialPrice:  orderDto.InitialPrice,
		FinalPrice:    orderDto.FinalPrice,
		Invoice:       orderDto.Invoice,
		CourierPrice:  orderDto.CourierPrice,
	}
}

func (c *checkoutRepo) extractOrderDetailProduct(orderDto dto.OrderDetailProducts) model.OrderDetailProducts {
	return model.OrderDetailProducts{
		OrderDetailId:               orderDto.OrderDetailId,
		VariantCombinationProductId: orderDto.VariantCombinationProductId,
		Quantity:                    orderDto.Quantity,
		InitialPrice:                orderDto.InitialPrice,
		FinalPrice:                  orderDto.FinalPrice,
		Name:                        orderDto.Name,
		Description:                 orderDto.Description,
		Price:                       orderDto.Price,
		MerchantId:                  orderDto.MerchantId,
	}
}

func PrettyPrint(i interface{}) string {
	s, _ := json.MarshalIndent(i, "", "\t")
	return string(s)
}
