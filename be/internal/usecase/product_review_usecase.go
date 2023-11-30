package usecase

import (
	"context"
	"digital-test-vm/be/internal/dto"
	"digital-test-vm/be/internal/model"
	repo "digital-test-vm/be/internal/repository"
	"digital-test-vm/be/internal/shared"
	"errors"
	"fmt"
)

var ErrRatingNotValid = errors.New(shared.ErrRatingNotValid.Message)

type productReviewUsecase struct {
	repo *repo.Repo
}

type ProductReviewUsecase interface {
	GetProductReview(c context.Context, req dto.GetProductReviewRequest) ([]dto.ProductReview, error)
	GetPaginationProductReview(c context.Context, req dto.GetProductReviewRequest) (dto.PaginationInfo, error)
	CreateProductReview(c context.Context, req dto.CreateProductReviewRequest, userId uint64) error
	IsProductReviewed(c context.Context, req dto.IsReviewRequest, userId uint64) (bool, error)
}

func NewProductReviewUsecase(repo *repo.Repo) ProductReviewUsecase {
	return &productReviewUsecase{
		repo: repo,
	}
}

func (u *productReviewUsecase) GetProductReview(c context.Context, req dto.GetProductReviewRequest) ([]dto.ProductReview, error) {
	res := []dto.ProductReview{}
	review, err := u.repo.ProductReviewRepo.GetProductReview(c, req)
	if err != nil {
		return res, err
	}
	for _, v := range review {
		image := []string{}
		userName, profilePicture, err := u.repo.UserRepo.FindNameAndPictureById(c, v.UserId)
		if err != nil {
			return res, err
		}
		urls, err := u.repo.ProductPhotoRepo.GetProductReviewPhotoByProductReviewId(c, v.ID)
		if err != nil {
			return res, err
		}
		for _, url := range urls {
			image = append(image, url.Url)
		}
		res = append(res, dto.ProductReview{ID: v.ID, Rating: v.Rating, Images: image, Description: v.Description, UserName: userName, ProfilePicture: profilePicture, CreatedAt: v.CreatedAt, UpdatedAt: v.UpdatedAt})
	}
	return res, nil
}

func (u *productReviewUsecase) GetPaginationProductReview(c context.Context, req dto.GetProductReviewRequest) (dto.PaginationInfo, error) {
	review, err := u.repo.ProductReviewRepo.GetAllProductReview(c, req)
	if err != nil {
		return dto.PaginationInfo{}, err
	}

	length := len(review)
	return dto.PaginationInfo{TotalItems: int64(length), TotalPages: (int64(length) + int64(req.Limit) - 1) / int64(req.Limit)}, nil
}

func (u *productReviewUsecase) CreateProductReview(c context.Context, req dto.CreateProductReviewRequest, userId uint64) error {
	if req.Rating < 1 || req.Rating > 5 {
		return fmt.Errorf("productReviewUsecase/shared.ErrProductNotFound %w", ErrRatingNotValid)
	}
	status, err := u.repo.OrderRepo.CheckOrderDetailStatus(c, req.OrderDetailId)
	if err != nil {
		return err
	}
	if status != shared.Completed.String() {
		return fmt.Errorf("productReviewUsecase/CreateProductReview %w", ErrOrderDetailStatus)
	}
	if valid := u.repo.ProductReviewRepo.IsProductReviewed(c, userId, req.ProductId, req.OrderDetailId); valid {
		return fmt.Errorf("productReviewUsecase/CreateProductReview %w", ErrProductReviewed)
	}
	productReview := model.ProductReview{ProductId: req.ProductId, UserId: userId, Rating: req.Rating, Photos: req.Images, Description: req.Comments, OrderDetailId: req.OrderDetailId}
	product, err := u.repo.ProductRepo.IsProductExist(c, req.ProductId)
	if err != nil {
		return fmt.Errorf("productReviewUsecase/shared.ErrProductNotFound %w", ErrProductNotFound)
	}
	if err = u.repo.ProductReviewRepo.CreateProductReview(c, productReview, product); err != nil {
		return err
	}
	return nil
}

func (u *productReviewUsecase) IsProductReviewed(c context.Context, req dto.IsReviewRequest, userId uint64) (bool, error) {
	if _, err := u.repo.ProductRepo.IsProductExist(c, req.ProductId); err != nil {
		return false, fmt.Errorf("productReviewUsecase/IsProductReviewed %w", ErrProductNotFound)
	}
	if err := u.repo.OrderRepo.IsOrderDetailExists(c, req.OrderDetailId); err != nil {
		return false, err
	}
	if valid := u.repo.ProductReviewRepo.IsProductReviewed(c, userId, req.ProductId, req.OrderDetailId); !valid {
		return false, nil
	}
	return true, nil
}
