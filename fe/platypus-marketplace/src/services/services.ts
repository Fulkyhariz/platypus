/*eslint no-unused-vars: "off"*/
import axios from "axios";
import { handleAxiosApiRequest } from "../utils/handleAxiosApiRequest";
import { axiosTokenized } from "@/utils/axiosTokenized";
import { ICheckOutPayload, ICheckPrice } from "@/interfaces/checkout";

const service = (() => {
  const getProvice = async () => {
    try {
      const response = await axios.get(
        `https://api.rajaongkir.com/starter/province`,
        {
          headers: {
            key: process.env.RAJA_ONGKIR_API_KEY,
          },
        },
      );

      const rajaongkirProvinces = response.data.rajaongkir.results;
      return {
        error: false,
        data: rajaongkirProvinces,
        message: response.statusText,
        code: response.status,
      };
    } catch (error: any) {
      return {
        error: true,
        data: null,
        message: error.response.data,
        code: error.response.status,
      };
    }
  };

  const getCities = async (provinceCode: string) => {
    try {
      const response = await axios.get(
        `https://api.rajaongkir.com/starter/city`,
        {
          params: { province: provinceCode },
          headers: {
            key: process.env.RAJA_ONGKIR_API_KEY,
          },
        },
      );
      //4acc68474d7b20b55df2534dc61458d2

      const rajaongkirCities = response.data.rajaongkir.results;
      return {
        error: false,
        data: rajaongkirCities,
        message: response.statusText,
        code: response.status,
      };
    } catch (error: any) {
      return {
        error: true,
        data: null,
        message: error.response.data,
        code: error.response.status,
      };
    }
  };

  const getCostRajaOngkir = async (
    origin: string,
    destination: string,
    weight: string,
    courier: string,
  ) => {
    try {
      const bodyParameters = {
        key: process.env.RAJA_ONGKIR_API_KEY,
        origin,
        destination,
        weight,
        courier: courier,
      };
      const response = await axios.post(
        `https://api.rajaongkir.com/starter/cost`,
        bodyParameters,
        {
          headers: {
            "content-type": "application/x-www-form-urlencoded",
          },
        },
      );

      const rajaongkirProvinces = response.data.rajaongkir.results[0];
      return {
        error: false,
        data: rajaongkirProvinces,
        message: response.statusText,
        code: response.status,
      };
    } catch (error: any) {
      return {
        error: true,
        data: null,
        message: error.response.data,
        code: error.response.status,
      };
    }
  };

  const getCost = async (
    origin: string,
    destination: string,
    weight: string,
    courier: string,
  ) => {
    try {
      const bodyParameters = {
        key: process.env.RAJA_ONGKIR_API_KEY_1,
        origin,
        destination,
        weight,
        courier: courier,
      };
      const response = await axios.post(
        `https://api.rajaongkir.com/starter/cost`,
        bodyParameters,
        {
          headers: {
            "content-type": "application/x-www-form-urlencoded",
          },
        },
      );

      const rajaongkirProvinces = response.data.rajaongkir.results[0];
      return {
        error: false,
        data: rajaongkirProvinces,
        message: response.statusText,
        code: response.status,
      };
    } catch (error: any) {
      return {
        error: true,
        data: null,
        message: error.response.data,
        code: error.response.status,
      };
    }
  };

  const postNewAddress = async (payload: any) => {
    return axiosTokenized<any>(
      "post",
      `${process.env.BASE_API_URL}/address`,
      {},
      payload,
    );
  };

  const putEditAddress = async (payload: any) => {
    return axiosTokenized<any>(
      "put",
      `${process.env.BASE_API_URL}/address`,
      {},
      payload,
    );
  };

  const postLogin = async (payload: any) => {
    return handleAxiosApiRequest<any>(
      "POST",
      `${process.env.BASE_API_URL}/login`,
      {},
      payload,
    );
  };

  const getUserData = async () => {
    return axiosTokenized<any>(
      "GET",
      `${process.env.BASE_API_URL}/user-details`,
      {},
    );
  };

  const getUserProductEdit = async (id: string) => {
    return axiosTokenized<any>(
      "GET",
      `${process.env.BASE_API_URL}/products/${id}/edit`,
      {},
    );
  };

  const getFavProductDetail = async (prodId: number) => {
    return axiosTokenized<any>(
      "GET",
      `${process.env.BASE_API_URL}/is-favorites/${prodId}`,
      {},
    );
  };

  const getWalletData = async () => {
    return axiosTokenized<any>(
      "GET",
      `${process.env.BASE_API_URL}/wallet/details`,
      {},
    );
  };

  const getProductReviews = async (
    id: number,
    page: number,
    sort: "oldest" | "newest" = "newest",
    images: boolean = false,
    comment: boolean = false,
    rating: number,
  ) => {
    const params: any = {
      page,
      sort,
    };
    if (rating > 0) {
      params.rating = rating;
    }
    if (images) {
      params.images = true;
    }
    if (comment) {
      params.comment = true;
    }
    return axiosTokenized<any>(
      "GET",
      `${process.env.BASE_API_URL}/products/${id}/reviews`,
      { params },
    );
  };

  const getAllMyProdcutList = async (
    page: number,
    exclude_no_stock: boolean,
    sort_by: string,
    sort: "asc" | "desc",
    username: string,
    search: string,
    exclude_not_active: boolean,
  ) => {
    const params: any = {
      page,
      sort,
      limit: 10,
    };
    if (exclude_no_stock) {
      params.exclude_no_stock = exclude_no_stock;
    }
    if (sort_by) {
      params.sort_by = sort_by;
    }
    if (search) {
      params.q = search;
    }
    if (exclude_not_active) {
      params.exclude_not_active = exclude_not_active;
    }

    return axiosTokenized<any>(
      "GET",
      `${process.env.BASE_API_URL}/merchants/${username}/products`,
      { params },
    );
  };

  const getAllMyOrderList = async (page: number) => {
    const params: any = {
      page,
    };

    return axiosTokenized<any>(
      "GET",
      `${process.env.BASE_API_URL}/orders/seller`,
      { params },
    );
  };

  const getOrderDetail = async (orderId: number) => {
    return axiosTokenized<any>(
      "GET",
      `${process.env.BASE_API_URL}/orders/seller/${orderId}`,
      {},
    );
  };

  const postWalletData = async (payload: any) => {
    return axiosTokenized<any>(
      "POST",
      `${process.env.BASE_API_URL}/wallet/set-up`,
      {},
      payload,
    );
  };

  const postTopUpPlatyPay = async (payload: any) => {
    return axiosTokenized<any>(
      "POST",
      `${process.env.BASE_API_URL}/wallet/top-up`,
      {},
      payload,
    );
  };

  const getUserAddresses = async () => {
    return axiosTokenized<any>(
      "GET",
      `${process.env.BASE_API_URL}/address`,
      {},
    );
  };

  const patchUserEmail = async (payload: any) => {
    return axiosTokenized<any>(
      "PATCH",
      `${process.env.BASE_API_URL}/user/change-email`,
      {},
      payload,
    );
  };

  const patchChangeProfilePict = async (url: string) => {
    return axiosTokenized<any>(
      "PATCH",
      `${process.env.BASE_API_URL}/user/change-profile-picture`,
      {},
      {
        photo_profile: url,
      },
    );
  };

  const patchAddressToUserDefault = async (id: number) => {
    return axiosTokenized<any>(
      "PATCH",
      `${process.env.BASE_API_URL}/address/user-set-default`,
      {},
      { address_id: id },
    );
  };

  const patchAddressToMerchantDefault = async (id: number) => {
    return axiosTokenized<any>(
      "PATCH",
      `${process.env.BASE_API_URL}/address/merchant-set-default`,
      {},
      { address_id: id },
    );
  };

  const postSendOTPChangePassword = async () => {
    return axiosTokenized<any>(
      "post",
      `${process.env.BASE_API_URL}/user/password/send-verify-code`,
      {},
    );
  };
  const postLinkToResetPassword = async (payload: any) => {
    return axiosTokenized<any>(
      "post",
      `${process.env.BASE_API_URL}/user/password/send-verify-link`,
      {},
      payload,
    );
  };

  const postVerifyOTPCode = async (payload: any) => {
    return axiosTokenized<any>(
      "post",
      `${process.env.BASE_API_URL}/user/password/verify-code`,
      {},
      payload,
    );
  };

  const postChangeWalletPin = async (payload: any, tokenChangePin: string) => {
    return handleAxiosApiRequest<any>(
      "POST",
      `${process.env.BASE_API_URL}/wallet/change-pin`,
      {
        headers: {
          Authorization: `Bearer ${tokenChangePin}`,
        },
      },
      payload,
    );
  };

  const patchChangePassword = async (payload: any, changeCode: string) => {
    return handleAxiosApiRequest<any>(
      "PATCH",
      `${process.env.BASE_API_URL}/user/password/change-password`,
      {
        headers: {
          Authorization: `Bearer ${changeCode}`,
        },
      },
      payload,
    );
  };

  const postVerifyChangePin = async (payload: any) => {
    return axiosTokenized<any>(
      "POST",
      `${process.env.BASE_API_URL}/wallet/verify-change-pin`,
      {},
      payload,
    );
  };

  const patchResetPassword = async (payload: any, changeCode: string) => {
    return handleAxiosApiRequest<any>(
      "PATCH",
      `${process.env.BASE_API_URL}/user/password/forgot-password`,
      {
        headers: {
          Authorization: `Bearer ${changeCode}`,
        },
      },
      payload,
    );
  };

  const postRegisterUser = async (payload: any) => {
    return axiosTokenized<any>(
      "POST",
      `${process.env.BASE_API_URL}/register`,
      {},
      payload,
    );
  };

  const postLikeProduct = async (payload: any) => {
    return axiosTokenized<any>(
      "POST",
      `${process.env.BASE_API_URL}/like-product`,
      {},
      payload,
    );
  };

  const getProductMerchantRecommendation = async (
    merchant_username: string,
  ) => {
    return handleAxiosApiRequest<any>(
      "GET",
      `${process.env.BASE_API_URL}/merchants/${merchant_username}/products?page=1&limit=10`,
      {},
    );
  };

  const deleteLikeProduct = async (payload: any) => {
    return axiosTokenized<any>(
      "DELETE",
      `${process.env.BASE_API_URL}/like-product`,
      {},
      payload,
    );
  };

  const postAddToCart = async (payload: any) => {
    return axiosTokenized<any>(
      "POST",
      `${process.env.BASE_API_URL}/cart`,
      {},
      payload,
    );
  };

  const postNewProduct = async (payload: any) => {
    return axiosTokenized<any>(
      "POST",
      `${process.env.BASE_API_URL}/products`,
      {},
      payload,
    );
  };

  const putUpdateProduct = async (payload: any, id: number) => {
    return axiosTokenized<any>(
      "PUT",
      `${process.env.BASE_API_URL}/products/${id}/update`,
      {},
      payload,
    );
  };

  const postRegisterUserMerchant = async (payload: any) => {
    return axiosTokenized<any>(
      "POST",
      `${process.env.BASE_API_URL}/register-merchant`,
      {},
      payload,
    );
  };

  const postLogout = async () => {
    return axiosTokenized<any>(
      "POST",
      `${process.env.BASE_API_URL}/logout`,
      {},
    );
  };

  const decreaseProdCart = async (payload: {
    cart_product_id: number;
    quantity: number;
  }) => {
    return axiosTokenized<any>(
      "DELETE",
      `${process.env.BASE_API_URL}/cart/delete`,
      {},
      payload,
    );
  };

  const increaseProdCart = async (payload: {
    cart_product_id: number;
    quantity: number;
  }) => {
    return axiosTokenized<any>(
      "POST",
      `${process.env.BASE_API_URL}/cart/add`,
      {},
      payload,
    );
  };

  const updateProdCart = async (payload: {
    cart_product_id: number;
    quantity: number;
  }) => {
    return axiosTokenized<any>(
      "PUT",
      `${process.env.BASE_API_URL}/cart/update`,
      {},
      payload,
    );
  };

  const cloudinaryUpload = async (imageFile: File) => {
    const formDataImage = new FormData();
    formDataImage.append("file", imageFile);
    formDataImage.append("upload_preset", `${process.env.CLOUDINARY_TOKEN}`);

    return handleAxiosApiRequest<any>(
      "POST",
      `${process.env.CLOUDINARY_UPLOAD}`,
      {},
      formDataImage,
    );
  };

  const postCheckOut = async (
    payload: ICheckOutPayload,
    checkoutToken: string,
  ) => {
    return handleAxiosApiRequest<any>(
      "POST",
      `${process.env.BASE_API_URL}/checkout`,
      {
        headers: {
          Authorization: `Bearer ${checkoutToken}`,
        },
      },
      payload,
    );
  };

  const deleteCart = async (payload: { cart_product_id: number }) => {
    return axiosTokenized<any>(
      "DELETE",
      `${process.env.BASE_API_URL}/cart`,
      {},
      payload,
    );
  };

  const postWalletAuth = async (payload: { pin: string }) => {
    return axiosTokenized<any>(
      "POST",
      `${process.env.BASE_API_URL}/wallet/auth`,
      {},
      payload,
    );
  };

  const getUserCart = async () => {
    return axiosTokenized<any>("GET", `${process.env.BASE_API_URL}/cart`, {});
  };

  const getPromos = async () => {
    return axiosTokenized<any>(
      "GET",
      `${process.env.BASE_API_URL}/checkout/promos`,
      {},
    );
  };

  const postNewPromotion = async (payload: any) => {
    return axiosTokenized<any>(
      "post",
      `${process.env.BASE_API_URL}/promotions`,
      {},
      payload,
    );
  };

  const deactiveProduct = async (payload: { product_id: number }) => {
    return axiosTokenized<any>(
      "DELETE",
      `${process.env.BASE_API_URL}/activate-products`,
      {},
      payload,
    );
  };

  const activateProduct = async (payload: { product_id: number }) => {
    return axiosTokenized<any>(
      "POST",
      `${process.env.BASE_API_URL}/activate-products`,
      {},
      payload,
    );
  };

  const postCheckPrice = async (payload: ICheckPrice) => {
    return axiosTokenized<any>(
      "POST",
      `${process.env.BASE_API_URL}/checkout/check-price`,
      {},
      payload,
    );
  };

  const putToProcess = async (payload: { order_detail_id: number }) => {
    return axiosTokenized<any>(
      "PUT",
      `${process.env.BASE_API_URL}/orders/status/processed`,
      {},
      payload,
    );
  };

  const putToDelivery = async (payload: { order_detail_id: number }) => {
    return axiosTokenized<any>(
      "PUT",
      `${process.env.BASE_API_URL}/orders/status/on-delivery`,
      {},
      payload,
    );
  };

  const getWalletHistory = async (page: number) => {
    const params: any = {
      page,
    };

    return axiosTokenized<any>(
      "GET",
      `${process.env.BASE_API_URL}/wallet/history`,
      { params },
    );
  };

  const postNewProductPromotion = async (payload: any) => {
    return axiosTokenized<any>(
      "post",
      `${process.env.BASE_API_URL}/promotions`,
      {},
      payload,
    );
  };

  const postNewReview = async (payload: any) => {
    return axiosTokenized<any>(
      "post",
      `${process.env.BASE_API_URL}/products/reviews`,
      {},
      payload,
    );
  };
  const setNewStatus = async (payload: any) => {
    return axiosTokenized<any>(
      "post",
      `${process.env.BASE_API_URL}/products/is-review`,
      {},
      payload,
    );
  };

  const putOrderCompleted = async (payload: any) => {
    return axiosTokenized<any>(
      "put",
      `${process.env.BASE_API_URL}/orders/status/completed`,
      {},
      { order_detail_id: payload },
    );
  };

  const getAllMyPromoList = async (
    page: number,
    status: string,
    username: string,
  ) => {
    const params: any = {
      page,
    };

    if (status) {
      params.status = status;
    }

    return axiosTokenized<any>(
      "GET",
      `${process.env.BASE_API_URL}/merchants/${username}/promotions?limit=10`,
      { params },
    );
  };

  return {
    getProvice,
    getCities,
    getCost,
    postNewAddress,
    postNewPromotion,
    postNewReview,
    setNewStatus,
    postSendOTPChangePassword,
    postVerifyOTPCode,
    getUserAddresses,
    postRegisterUser,
    postLogin,
    postLogout,
    getUserData,
    getWalletData,
    patchChangePassword,
    patchUserEmail,
    cloudinaryUpload,
    patchChangeProfilePict,
    postLinkToResetPassword,
    patchResetPassword,
    putEditAddress,
    patchAddressToUserDefault,
    postWalletData,
    patchAddressToMerchantDefault,
    postRegisterUserMerchant,
    getProductReviews,
    postTopUpPlatyPay,
    postVerifyChangePin,
    postChangeWalletPin,
    postLikeProduct,
    deleteLikeProduct,
    postAddToCart,
    getProductMerchantRecommendation,
    getFavProductDetail,
    postNewProduct,
    getUserProductEdit,
    putUpdateProduct,
    decreaseProdCart,
    increaseProdCart,
    updateProdCart,
    postCheckOut,
    getUserCart,
    deleteCart,
    getCostRajaOngkir,
    postWalletAuth,
    getPromos,
    getAllMyProdcutList,
    deactiveProduct,
    activateProduct,
    postCheckPrice,
    getAllMyOrderList,
    getOrderDetail,
    putToProcess,
    putToDelivery,
    getWalletHistory,
    postNewProductPromotion,
    getAllMyPromoList,
    putOrderCompleted,
  };
})();

export default service;
