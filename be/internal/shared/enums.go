package shared

type ProductsSortCriteria uint64

const (
	TotalSold ProductsSortCriteria = iota
	Rating
	Price
	Date
	Recommended
)

const DateFormat = "02/01/2006"

func (psc ProductsSortCriteria) String() string {
	switch psc {
	case TotalSold:
		return "total_sold"
	case Rating:
		return "rating"
	case Price:
		return "price"
	case Date:
		return "date"
	case Recommended:
		return "recommended"
	}
	return "unknown"
}

func (psc ProductsSortCriteria) Translate() string {
	switch psc {
	case TotalSold:
		return "total_sold"
	case Rating:
		return "average_rating"
	case Price:
		return "min_price"
	case Date:
		return "created_at"
	case Recommended:
		return "recommended"
	}
	return "unknown"
}

type SortOrder uint64

const (
	ASC SortOrder = iota
	DESC
)

func (so SortOrder) String() string {
	switch so {
	case ASC:
		return "ASC"
	case DESC:
		return "DESC"
	}
	return "unknown"
}

type OrderStatus struct {
	status string
}

var WaitingForSeller OrderStatus = NewOrderStatus("Waiting for Seller")
var Canceled OrderStatus = NewOrderStatus("Canceled")
var Processed OrderStatus = NewOrderStatus("Processed")
var OnDelivery OrderStatus = NewOrderStatus("On Delivery")
var Delivered OrderStatus = NewOrderStatus("Delivered")
var Received OrderStatus = NewOrderStatus("Received")
var Completed OrderStatus = NewOrderStatus("Completed")
var Reviewed OrderStatus = NewOrderStatus("Reviewed")

func NewOrderStatus(status string) OrderStatus {
	return OrderStatus{
		status: status,
	}
}

func (o *OrderStatus) String() string {
	return o.status
}

type VoucherScope struct {
	status string
}

var GlobalScope VoucherScope = NewVoucherScope("GLOBAL")
var MerchantScope VoucherScope = NewVoucherScope("MERCHANT")
var ProductScope VoucherScope = NewVoucherScope("PRODUCT")

func NewVoucherScope(status string) VoucherScope {
	return VoucherScope{
		status: status,
	}
}

func (o *VoucherScope) String() string {
	return o.status
}

type VoucherType struct {
	status string
}

var Discount VoucherType = NewVoucherType("DISC")
var Cut VoucherType = NewVoucherType("CUT")

func NewVoucherType(status string) VoucherType {
	return VoucherType{
		status: status,
	}
}

func (o *VoucherType) String() string {
	return o.status
}

const ADMIN_WALLET uint64 = 3

var ADMIN_COURIER map[string]uint64 = map[string]uint64{
	"jne":  4,
	"pos":  5,
	"tiki": 6,
}

type BooleanQueryParams uint64

const (
	False BooleanQueryParams = iota
	True
)

func (e BooleanQueryParams) String() string {
	switch e {
	case False:
		return "false"
	case True:
		return "true"
	}
	return "unknown"
}

func (e BooleanQueryParams) Bool() bool {
	switch e {
	case True:
		return true
	}
	return false
}

type PromotionStatus struct {
	status string
}

func NewPromotionStatus(status string) PromotionStatus {
	return PromotionStatus{
		status: status,
	}
}

func (o *PromotionStatus) String() string {
	return o.status
}

var (
	PromotionStatusAll      = NewPromotionStatus("all")
	PromotionStatusOngoing  = NewPromotionStatus("ongoing")
	PromotionStatusWillCome = NewPromotionStatus("will_come")
	PromotionStatusEnded    = NewPromotionStatus("has_ended")
)
