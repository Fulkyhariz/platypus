package repo

import (
	"context"
	"digital-test-vm/be/internal/dto"
	"digital-test-vm/be/internal/model"
	"fmt"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type cartRepo struct {
	db *gorm.DB
}

type CartRepo interface {
	AddProductToCart(c context.Context, req dto.AddProductToCartRequest, cartId uint64) error
	DeleteProductFromCart(c context.Context, id uint64, cartId uint64) error
	ClearCart(c context.Context, cartId uint64) error
	IsProductCartExist(c context.Context, id uint64, cartId uint64) error
	CreateCart(c context.Context, tx *gorm.DB, userId uint64) (*gorm.DB, error)

	GetCartDetails(c context.Context, cartId uint64) ([]model.CartProductDetail, error)
	IsProductExistInCart(c context.Context, variantCombinationProductId, cartId uint64) (*model.CartProducts, bool)
	AddQuantityToCart(c context.Context, stock, cartProductId uint64) error
	GetCartProductById(c context.Context, cartProductId uint64) (*model.CartProducts, error)
	GetCartById(c context.Context, cartId uint64) (*model.Cart, error)
	DecreaseQuantityToCart(c context.Context, stock, cartProductId uint64) error
	SetQuantityToCart(c context.Context, stock, cartProductId uint64) error
}

func NewCartRepo(db *gorm.DB) CartRepo {
	return &cartRepo{db: db}
}

func (r *cartRepo) ClearCart(c context.Context, cartId uint64) error {
	err := r.db.Where("cart_id = ?", cartId).Delete(&model.CartProduct{}).Error
	if err != nil {
		return fmt.Errorf("cartRepo/ClearCart %w", err)
	}
	return nil
}

func (r *cartRepo) GetCartDetails(c context.Context, cartId uint64) ([]model.CartProductDetail, error) {
	res := []model.CartProductDetail{}
	err := r.db.WithContext(c).Raw(`SELECT 
	cp.id AS cart_product_id,
	vcp.product_id AS product_id, 
	vcp.id AS variant_combination_product_id,
	merchant_id,
	a.district_code AS city_id,
	m."name" AS merchant_name,
	title , 
	pp.url as photo, 
	cp.quantity AS amount , 
	vt.type_name AS variant_parrent, 
	vtt.type_name AS variant_child , 
	vcp.price  AS price,
	p.weight as weight,
	vcp.stock AS stock
FROM products p INNER JOIN variant_combination_products vcp ON p.id = vcp.product_id 
INNER JOIN cart_products cp ON vcp.id = cp.variant_combination_product_id
INNER JOIN variant_combinations vc ON vcp.variant_combination_id = vc.id 
LEFT JOIN variant_types vt ON vc.variant_type_parent_id = vt.id 
LEFT JOIN variant_types vtt ON vc.variant_type_child_id = vtt.id 
INNER JOIN product_photos pp ON pp.product_id = vcp.product_id 
INNER JOIN merchants m ON m.id = p.merchant_id 
INNER JOIN addresses a ON m.user_id = a.user_id 
WHERE cp.cart_id = ? AND pp.is_default = TRUE AND 
a.is_shop_location = TRUE AND cp.deleted_at is NULL`, cartId).Scan(&res).Error

	if err != nil {
		return nil, fmt.Errorf("cartRepo/GetCartDetails %w", err)
	}

	return res, nil
}

func (r *cartRepo) CreateCart(c context.Context, tx *gorm.DB, userId uint64) (*gorm.DB, error) {
	var cart model.Cart
	cart.UserId = userId
	if tx == nil {
		tx = r.db.WithContext(c).Begin()
		defer tx.Commit()
	}
	err := tx.Create(&cart).Error
	if err != nil {
		tx.Rollback()
		return tx, err
	}
	return tx, nil
}

func (r *cartRepo) AddProductToCart(c context.Context, req dto.AddProductToCartRequest, cartId uint64) error {
	cartProduct := model.CartProducts{CartId: cartId, VariantCombinationProductId: req.VariantCombinationProductId, Quantity: req.Stock}
	if err := r.db.WithContext(c).Create(&cartProduct).Error; err != nil {
		return fmt.Errorf("cartRepo/AddProductToCart %w", ErrInternalServerError)
	}
	return nil
}

func (r *cartRepo) FindProductCartById(c context.Context, cartProductId uint64) error {
	var checkoutProduct []model.CheckoutProduct

	tx := r.db.Begin()
	defer tx.Rollback()

	err := tx.Where("id = ?", cartProductId).First(&checkoutProduct).Error
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("cartRepo/FindProductCartById %w", ErrInternalServerError)
	}

	tx.Commit()

	return nil
}

func (r *cartRepo) DeleteProductFromCart(c context.Context, id uint64, cartId uint64) error {
	tx := r.db.Begin()
	tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&model.CartProducts{}, id)
	if err := tx.WithContext(c).Where("id=? and cart_id=?", id, cartId).Delete(&model.CartProducts{}).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("cartRepo/DeleteProductFromCart %w", ErrInternalServerError)
	}
	tx.Commit()

	return nil
}

func (r *cartRepo) IsProductCartExist(c context.Context, id uint64, cartId uint64) error {
	var res model.CartProducts
	if err := r.db.WithContext(c).Model(&model.CartProducts{}).Where("id=?", id).First(&res).Error; err != nil {
		return fmt.Errorf("cartRepo/IsProductCartExist %w", ErrCartProductNotFound)
	}
	if err := r.db.WithContext(c).Model(&model.CartProducts{}).Where("id=? and cart_id=?", id, cartId).First(&res).Error; err != nil {
		return fmt.Errorf("cartRepo/IsProductCartExist %w", ErrUnauthorizedAccess)
	}
	return nil
}

func (r *cartRepo) IsProductExistInCart(c context.Context, variantCombinationProductId, cartId uint64) (*model.CartProducts, bool) {
	var res *model.CartProducts
	if err := r.db.WithContext(c).Model(&model.CartProducts{}).Where("cart_id=? and variant_combination_product_id=?", cartId, variantCombinationProductId).First(&res).Error; err != nil {
		return nil, false
	}
	return res, true
}

func (r *cartRepo) AddQuantityToCart(c context.Context, stock, cartProductId uint64) error {
	tx := r.db.Begin().WithContext(c)
	tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&model.CartProducts{}, cartProductId)
	if err := tx.WithContext(c).Model(&model.CartProducts{}).Where("id=?", cartProductId).Update("quantity", gorm.Expr("quantity+?", stock)).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("cartRepo/AddQuantityToCart %w", ErrInternalServerError)
	}
	tx.Commit()
	return nil
}

func (r *cartRepo) DecreaseQuantityToCart(c context.Context, stock, cartProductId uint64) error {
	tx := r.db.Begin().WithContext(c)
	tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&model.CartProducts{}, cartProductId)
	if err := tx.WithContext(c).Model(&model.CartProducts{}).Where("id=?", cartProductId).Update("quantity", gorm.Expr("quantity-?", stock)).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("cartRepo/AddQuantityToCart %w", ErrInternalServerError)
	}
	tx.Commit()
	return nil
}

func (r *cartRepo) SetQuantityToCart(c context.Context, stock, cartProductId uint64) error {
	tx := r.db.Begin().WithContext(c)
	tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&model.CartProducts{}, cartProductId)
	if err := tx.WithContext(c).Model(&model.CartProducts{}).Where("id=?", cartProductId).Update("quantity", stock).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("cartRepo/AddQuantityToCart %w", ErrInternalServerError)
	}
	tx.Commit()
	return nil
}

func (r *cartRepo) GetCartProductById(c context.Context, cartProductId uint64) (*model.CartProducts, error) {
	var res *model.CartProducts
	if err := r.db.WithContext(c).Model(&model.CartProducts{}).Where("id=?", cartProductId).First(&res).Error; err != nil {
		return nil, fmt.Errorf("cartRepo/GetCartProductById %w", ErrCartProductNotFound)
	}
	return res, nil
}

func (r *cartRepo) GetCartById(c context.Context, cartId uint64) (*model.Cart, error) {
	var res *model.Cart
	if err := r.db.WithContext(c).Model(&model.Cart{}).Where("id=?", cartId).First(&res).Error; err != nil {
		return nil, fmt.Errorf("cartRepo/GetCartById %w", ErrInternalServerError)
	}
	return res, nil
}
