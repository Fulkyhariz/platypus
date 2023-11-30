package server

import (
	"digital-test-vm/be/internal/middleware"
	"digital-test-vm/be/internal/shared"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (s *Server) InitRouter() {
	s.Router = gin.Default()
	r := s.Router
	r.ContextWithFallback = true

	r.Use(middleware.GlobalErrorHandler())
	r.Use(middleware.Logger())
	r.Use(middleware.CORSMiddleware())
	r.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, shared.ErrPageNotFound.Message)
	})

	r.GET("/ping", s.Handler.Ping.PingHandler)
	likeProduct := r.Group("/like-product", middleware.AuthMiddleware())
	{
		likeProduct.POST("", s.Handler.ProductFavoriteHandler.LikeProduct)
		likeProduct.DELETE("", s.Handler.ProductFavoriteHandler.DislikeProduct)

	}
	cart := r.Group("/cart", middleware.AuthMiddleware())
	{
		cart.POST("", s.Handler.CartHandler.AddProductToCart)
		cart.DELETE("", s.Handler.CartHandler.DeleteProductFromCart)
		cart.GET("", s.Handler.CartHandler.GetCartDetailHandler)
		cart.POST("/add", s.Handler.CartHandler.AddQuantityToCart)
		cart.DELETE("/delete", s.Handler.CartHandler.DecreaseQuantityToCart)
		cart.PUT("/update", s.Handler.CartHandler.SetQuantityToCart)
	}

	r.POST("/register", s.Handler.UserHandler.RegisterUserHandler)
	r.POST("/login", s.Handler.UserHandler.LoginHandler)

	logout := r.Group("/logout", middleware.AuthMiddleware())
	logout.POST("", s.Handler.UserHandler.LogOutHandler)

	refresh := r.Group("/refresh-token", middleware.RefreshTokenMiddleware())
	refresh.POST("", s.Handler.UserHandler.RefreshTokenHandler)

	registerMerchant := r.Group("/register-merchant", middleware.AuthMiddleware())
	registerMerchant.POST("", s.Handler.UserHandler.RegisterMerchantHandler)

	userDetail := r.Group("/user-details", middleware.AuthMiddleware())
	userDetail.GET("", s.Handler.UserHandler.UserDetailHandler)

	address := r.Group("/address", middleware.AuthMiddleware())
	{
		address.POST("", s.Handler.AddressHandler.AddAddressHandler)
		address.PATCH("/merchant-set-default", s.Handler.AddressHandler.SetMerchantDefaultHandler)
		address.PATCH("/user-set-default", s.Handler.AddressHandler.SetUserDefaultHandler)
		address.PUT("", s.Handler.AddressHandler.UpdateAddressHandler)
		address.GET("", s.Handler.AddressHandler.FindAllAddressHandler)
		address.DELETE("", s.Handler.AddressHandler.DeleteAddressHandler)
	}

	user := r.Group("/user", middleware.AuthMiddleware())
	{
		user.POST("/password/send-verify-code", s.Handler.UserHandler.SendPasswordVerificationCodeHandler)
		user.POST("/password/verify-code", s.Handler.UserHandler.PasswordVerificationCodeHandler)
		user.PATCH("/change-profile-picture", s.Handler.UserHandler.ChangeProfilePictureHandler)
		user.PATCH("/change-email", s.Handler.UserHandler.ChangeEmailHandler)
	}
	changePassword := r.Group("", middleware.ChangePasswordTokenMiddleware())
	{
		changePassword.PATCH("/user/password/change-password", s.Handler.UserHandler.ChangePasswordHandler)
	}
	r.POST("/user/password/send-verify-link", s.Handler.UserHandler.ForgotPasswordHandler)

	forgotPassword := r.Group("", middleware.ForgotPasswordTokenMiddleware())
	{
		forgotPassword.PATCH("/user/password/forgot-password", s.Handler.UserHandler.ChangePasswordHandler)
	}

	//merchants
	merchants := r.Group("/merchants")
	{
		merchants.GET("/:username", s.Handler.MerchantHandler.GetMerchantHandler)
		merchants.GET("/:username/products", s.Handler.MerchantHandler.GetMerchantProductsHandler)
		merchants.GET("/:username/categories", s.Handler.MerchantHandler.GetMerchantCategoriesHandler)
		merchants.GET("/:username/promotions", s.Handler.MerchantHandler.GetMerchantPromotionsHandler)
	}

	//categories
	categories := r.Group("/categories")
	{
		categories.GET("", s.Handler.CategoryHandler.GetCategories)
		categories.GET("/:id", s.Handler.CategoryHandler.GetCategoryByID)
	}

	//products
	products := r.Group("/products")
	{
		products.GET("/:id", s.Handler.ProductHandler.ProductDetail)
		products.GET("", s.Handler.ProductHandler.GetProducts)
		products.GET("/:id/reviews", s.Handler.ProductReviewHandler.GetProductReview)
		products.POST("/reviews", middleware.AuthMiddleware(), s.Handler.ProductReviewHandler.CreateProductReview)
		products.GET("/is-review", middleware.AuthMiddleware(), s.Handler.ProductReviewHandler.IsReviewed)
	}

	productsAuth := r.Group("/products", middleware.AuthMiddleware())
	{
		productsAuth.POST("", s.Handler.ProductHandler.CreateProductHandler)
		productsAuth.GET("/:id/edit", s.Handler.ProductHandler.EditProductHandler)
		productsAuth.PUT("/:id/update", s.Handler.ProductHandler.UpdateProductHandler)
	}

	//activate products
	activateProduct := r.Group("/activate-products", middleware.AuthMiddleware())
	{
		activateProduct.DELETE("", s.Handler.ProductHandler.DeactivateProduct)
		activateProduct.POST("", s.Handler.ProductHandler.ActivateProduct)
	}

	wallets := r.Group("/wallet", middleware.AuthMiddleware())
	{
		wallets.POST("/set-up", s.Handler.WalletHandler.RegisterWalletHandler)
		wallets.POST("/top-up", s.Handler.WalletHandler.TopUpWalletHandler)
		wallets.GET("/details", s.Handler.WalletHandler.WalletDetailsHandler)
		wallets.POST("/verify-change-pin", s.Handler.WalletHandler.ValidateChangePinHandler)
		wallets.POST("/auth", s.Handler.WalletHandler.AuthenticateWalletHandler)
		wallets.GET("/history", s.Handler.WalletHandler.WalletHistoryHandler)
	}
	changePin := r.Group("/wallet/change-pin", middleware.ChangePinTokenMiddleware())
	changePin.POST("", s.Handler.WalletHandler.ChangePinHandler)

	favorite := r.Group("")
	{
		favorite.GET("/product-favorites", middleware.AuthMiddleware(), s.Handler.ProductFavoriteHandler.GetProductFavorite)
		favorite.GET("/is-favorites/:id", middleware.AuthMiddleware(), s.Handler.ProductFavoriteHandler.IsFavorite)
	}

	checkout := r.Group("/checkout")
	{
		checkout.POST("", middleware.StepUpTokenMiddleware(), s.Handler.CheckoutHandler.CheckoutCartHandler)
		checkout.POST("/check-price", middleware.AuthMiddleware(), s.Handler.CheckoutHandler.CheckPriceHandler)
		checkout.GET("/promos", middleware.AuthMiddleware(), s.Handler.CheckoutHandler.GetPromoHandler)
	}
	order := r.Group("/orders", middleware.AuthMiddleware())
	{
		order.GET("", s.Handler.OrderHandler.GetOrders)
		order.GET("/:id", s.Handler.OrderHandler.GetOrderDetail)
		order.GET("/seller", s.Handler.OrderHandler.GetListSellerOrder)
		order.GET("/seller/:id", s.Handler.OrderHandler.GetDetailSellerOrder)
		order.PUT("/status/processed", s.Handler.OrderHandler.ChangeOrderStatusToProcessed)
		order.PUT("/status/on-delivery", s.Handler.OrderHandler.ChangeOrderStatusToOnDelivery)
		order.PUT("/status/completed", s.Handler.OrderHandler.ChangeOrderStatusToCompleted)
		order.PUT("/status/reviewed", s.Handler.OrderHandler.ChangeOrderStatusToReviewed)
	}

	r.PUT("orders/status/delivered", s.Handler.OrderHandler.ChangeOrderStatusToDelivered)

	//promotions
	promotionsAuth := r.Group("/promotions", middleware.AuthMiddleware())
	{
		promotionsAuth.POST("", s.Handler.PromotionHandler.CreateMerchantPromotion)
	}
}
