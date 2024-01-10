package shared

import (
	"fmt"
	"net/http"
)

var (
	/* Error code 400 */
	ErrBadRequest              = NewHTTPError(http.StatusBadRequest, "bad request")
	ErrDislikeProduct          = NewHTTPError(http.StatusBadRequest, "you cannot disliked product")
	ErrRatingNotValid          = NewHTTPError(http.StatusBadRequest, "rating is not valid")
	ErrPasswordIsSame          = NewHTTPError(http.StatusBadRequest, "password can't be the same as before")
	ErrPinIsSame               = NewHTTPError(http.StatusBadRequest, "pin can't be the same as before")
	ErrOrderDetailStatus       = NewHTTPError(http.StatusBadRequest, "you have no authorized with order detail status")
	ErrProductReviewed         = NewHTTPError(http.StatusBadRequest, "product has been reviewed")
	ErrProductVariantStock     = NewHTTPError(http.StatusBadRequest, "invalid stock on product variant")
	ErrInsufficientBalance     = NewHTTPError(http.StatusBadRequest, "insufficient balance")
	ErrDecreasedStock          = NewHTTPError(http.StatusBadRequest, "cannot decreased stock")
	ErrListTransactionNotFound = NewHTTPError(http.StatusBadRequest, "list transaction not found")
	ErrOrderNotFound           = NewHTTPError(http.StatusBadRequest, "order not found")
	ErrInvalidAddress           = NewHTTPError(http.StatusBadRequest, "invalid address")

	/* Error code 401 */
	ErrUnauthorizedAccess   = NewHTTPError(http.StatusUnauthorized, "you have no authorized to access")
	ErrInvalidSigningMethod = NewHTTPError(http.StatusUnauthorized, "invalid signing method")
	ErrAlreadyLoggedOut     = NewHTTPError(http.StatusUnauthorized, "already logged out")
	ErrParseClaims          = NewHTTPError(http.StatusUnauthorized, "error parse claims")
	ErrInvalidJWTToken      = NewHTTPError(http.StatusUnauthorized, "invalid jwt token")
	ErrClaimsNotFound       = NewHTTPError(http.StatusUnauthorized, "claims not found")
	ErrWrongCredential      = NewHTTPError(http.StatusUnauthorized, "username or password invalid")
	ErrWrongPin             = NewHTTPError(http.StatusUnauthorized, "invalid pin")

	/* Error code 403 */
	ErrCodeIsNotValid    = NewHTTPError(http.StatusForbidden, "verification code invalid")
	ErrForbiddenResource = NewHTTPError(http.StatusForbidden, "trying to access forbidden resource")
	ErrWalletBlocked     = NewHTTPError(http.StatusForbidden, "wallet is blocket for invalid pin try again later")
	ErrNotHaveAddress    = NewHTTPError(http.StatusForbidden, "please set up an address before regisered as a merchant")

	/* Error code 404 */
	ErrPageNotFound        = NewHTTPError(http.StatusNotFound, "404 page not found")
	ErrProductNotFound     = NewHTTPError(http.StatusNotFound, "product not found")
	ErrMerchantNotFound    = NewHTTPError(http.StatusNotFound, "merchant not found")
	ErrCategoryNotFound    = NewHTTPError(http.StatusNotFound, "category not found")
	ErrVariantNotFound     = NewHTTPError(http.StatusNotFound, "product variant not found")
	ErrUserNotFound        = NewHTTPError(http.StatusNotFound, "user not found")
	ErrWalletNotFound      = NewHTTPError(http.StatusNotFound, "wallet not found")
	ErrCartProductNotFound = NewHTTPError(http.StatusNotFound, "cart product not found")
	ErrPhotoNotFound       = NewHTTPError(http.StatusNotFound, "photo not found")
	ErrCartEmpty           = NewHTTPError(http.StatusNotFound, "cart is empty")
	ErrOrderDetailNotFound = NewHTTPError(http.StatusNotFound, "ErrOrderDetailNotFound")

	/* Error code 409 */
	ErrAlreadyHaveMerchant  = NewHTTPError(http.StatusConflict, "already have merchant")
	ErrAlreadyRegistered    = NewHTTPError(http.StatusConflict, "username or email already used")
	ErrWalletAlreadyCreated = NewHTTPError(http.StatusConflict, "wallet already created")

	/* Error Code 500 */
	ErrInternalServerError            = NewHTTPError(http.StatusInternalServerError, "internal server error")
	ErrConvertToInteger               = NewHTTPError(http.StatusInternalServerError, "cannot convert to integer")
	ErrGenerateTokenFailed            = NewHTTPError(http.StatusInternalServerError, "token generation failed")
	ErrGenerateVerificationCodeFailed = NewHTTPError(http.StatusInternalServerError, "verification code generation failed")
	ErrTopUpFailed                    = NewHTTPError(http.StatusInternalServerError, "topup failed")
)

type HTTPError struct {
	StatusCode    int    `json:"code"`
	Message       string `json:"message"`
	InternalError error
}

type ErrorDto struct {
	Message string `json:"message"`
}

func (e HTTPError) Error() string {
	return fmt.Sprintf("Error %s", e.InternalError)
}

func (e HTTPError) ToErrorDto() ErrorDto {
	return ErrorDto{
		Message: e.Message,
	}
}

func NewHTTPError(statusCode int, message string) HTTPError {
	return HTTPError{
		StatusCode: statusCode,
		Message:    message,
	}
}
