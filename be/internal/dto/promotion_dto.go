package dto

import (
	"digital-test-vm/be/internal/model"
	"digital-test-vm/be/internal/shared"
	"fmt"
	"strconv"
	"time"

	"github.com/shopspring/decimal"
)

type Promotion struct {
	ID             uint64
	Banner         string
	Name           string
	PromotionType  shared.VoucherType
	PromotionScope shared.VoucherScope
	VoucherCode    string
	Amount         decimal.Decimal
	Quota          uint64
	MaxAmount      *decimal.Decimal
	StartDate      time.Time
	EndDate        time.Time
	Products       []ListProduct
	CreatedAt      time.Time
	UpdatedAt      time.Time
	DeletetAt      *time.Time
}

func PromotionToDTO(promotion model.Promotion) *Promotion {
	var promoType shared.VoucherType
	switch {
	case promotion.PromotionType == shared.Discount.String():
		promoType = shared.Discount
	case promotion.PromotionType == shared.Cut.String():
		promoType = shared.Cut
	}

	var promoScope shared.VoucherScope
	switch {
	case promotion.PromotionScope == shared.GlobalScope.String():
		promoScope = shared.GlobalScope
	case promotion.PromotionScope == shared.MerchantScope.String():
		promoScope = shared.MerchantScope
	case promotion.PromotionScope == shared.ProductScope.String():
		promoScope = shared.ProductScope
	}
	promotionDTO := &Promotion{
		ID:             promotion.ID,
		Banner:         promotion.Banner,
		Name:           promotion.Name,
		PromotionType:  promoType,
		PromotionScope: promoScope,
		VoucherCode:    promotion.VoucherCode,
		Amount:         decimal.NewFromFloat(promotion.Amount),
		Quota:          promotion.Quota,
		StartDate:      promotion.StartDate,
		EndDate:        promotion.EndDate,
		CreatedAt:      promotion.CreatedAt,
		UpdatedAt:      promotion.UpdatedAt,
		DeletetAt:      promotion.DeletedAt,
	}
	if promotion.MaxAmount != nil {
		promotionDTO.MaxAmount = promotion.MaxAmount
	}
	if promotion.Products != nil || len(promotion.Products) > 0 {
		for _, p := range promotion.Products {
			promotionDTO.Products = append(promotionDTO.Products, *ListProductToDTO(p))
		}
	}
	return promotionDTO
}

func (p *Promotion) ToModel() *model.Promotion {
	promotion := &model.Promotion{
		ID:             p.ID,
		Banner:         p.Banner,
		Name:           p.Name,
		PromotionType:  p.PromotionType.String(),
		PromotionScope: p.PromotionScope.String(),
		VoucherCode:    p.VoucherCode,
		Amount:         p.Amount.InexactFloat64(),
		Quota:          p.Quota,
		StartDate:      p.StartDate,
		EndDate:        p.EndDate,
	}
	if p.MaxAmount != nil {
		promotion.MaxAmount = p.MaxAmount
	}
	return promotion
}

type ManagePromotion struct {
	Promotion *Promotion
	Products  []uint64
}

func RequestToManagePromotionDTO(req ManagePromotionRequest) (*ManagePromotion, error) {
	var promoType shared.VoucherType
	switch {
	case req.PromotionType == shared.Discount.String():
		promoType = shared.Discount
	case req.PromotionType == shared.Cut.String():
		promoType = shared.Cut
	}

	var promoScope shared.VoucherScope
	switch {
	case req.PromotionScope == shared.GlobalScope.String():
		promoScope = shared.GlobalScope
	case req.PromotionScope == shared.MerchantScope.String():
		promoScope = shared.MerchantScope
	case req.PromotionScope == shared.ProductScope.String():
		promoScope = shared.ProductScope
	}

	amount, err := decimal.NewFromString(req.Amount)
	if err != nil {
		return nil, fmt.Errorf("RequestToManagePromotionDTO: %w", err)
	}

	quota, err := strconv.Atoi(req.Quota)
	if err != nil {
		return nil, fmt.Errorf("RequestToManagePromotionDTO: %w", err)
	}

	dateString := "2006-01-02"
	startDate, err := time.Parse(dateString, req.StartDate)
	if err != nil {
		return nil, fmt.Errorf("RequestToManagePromotionDTO: %w", err)
	}

	endDate, err := time.Parse(dateString, req.EndDate)
	if err != nil {
		return nil, fmt.Errorf("RequestToManagePromotionDTO: %w", err)
	}

	promotion := &Promotion{
		ID:             req.ID,
		Name:           req.Name,
		PromotionType:  promoType,
		PromotionScope: promoScope,
		VoucherCode:    req.VoucherCode,
		Amount:         amount,
		Quota:          uint64(quota),
		StartDate:      startDate,
		EndDate:        endDate,
	}

	if req.MaxAmount != "" {
		maxAmount, err := decimal.NewFromString(req.MaxAmount)
		if err != nil {
			return nil, fmt.Errorf("RequestToManagePromotionDTO: %w", err)
		}

		promotion.MaxAmount = &maxAmount
	}

	if req.Banner != "" {
		promotion.Banner = req.Banner
	}

	createPromotionDTO := &ManagePromotion{
		Promotion: promotion,
	}

	if req.Products != nil {
		createPromotionDTO.Products = req.Products
	}

	return createPromotionDTO, nil
}

func (p *Promotion) ToListMerchantPromotionResponse() *ListMerchantPromotionResponse {
	res := &ListMerchantPromotionResponse{
		ID:             p.ID,
		Banner:         p.Banner,
		Name:           p.Name,
		PromotionType:  p.PromotionType.String(),
		PromotionScope: p.PromotionScope.String(),
		VoucherCode:    p.VoucherCode,
		Amount:         p.Amount.String(),
		Quota:          strconv.Itoa(int(p.Quota)),
		StartDate:      p.StartDate.String(),
		EndDate:        p.EndDate.String(),
	}
	if p.PromotionType.String() == shared.Discount.String() {
		strMaxAmount := p.MaxAmount.String()
		res.MaxAmount = &strMaxAmount
	}
	if p.Products != nil || len(p.Products) > 0 {
		for _, p := range p.Products {
			res.Products = append(res.Products, *p.ToResponse())
		}
	}
	today := time.Now()
	switch {
	case today.Before(p.StartDate):
		res.Status = shared.PromotionStatusWillCome.String()
	case today.After(p.EndDate):
		res.Status = shared.PromotionStatusEnded.String()
	case today.After(p.StartDate) && today.Before(p.EndDate):
		res.Status = shared.PromotionStatusOngoing.String()
	}
	return res
}
