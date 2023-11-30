import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { setCookie } from "cookies-next";
const axiosApiInstance = axios.create();

axiosApiInstance.interceptors.request.use(
  async (config) => {
    const accessToken =
      config.headers.Authorization || config.headers.authorization;

    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
      config.headers["Accept"] = "application/json";
      config.headers["Content-Type"] = "application/json";
      // config.headers["Content-Type"] = "application/x-www-form-urlencoded";
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  },
);

// Response interceptor for API calls
axiosApiInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async function (error) {
    const originalRequest = error.config;
    const refreshToken =
      error.config.headers.RefreshToken || error.config.headers.refreshtoken;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const access_token = await refreshAccessToken(refreshToken as string);

      axios.defaults.headers.common["Authorization"] = "Bearer " + access_token;
      return axiosApiInstance(originalRequest);
    }
    return Promise.reject(error);
  },
);

async function refreshAccessToken(refreshToken: string) {
  try {
    const response = await axios.post(
      `${process.env.BASE_API_URL}/refresh-token`,
      null,
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      },
    );

    const newAccessToken = response.data.data.access_token;

    setCookie("accessToken", newAccessToken, { path: "/" });

    return newAccessToken;
  } catch (error) {
    throw error;
  }
}
interface ApiResponse<T> {
  error: boolean;
  data?: T | null;
  message: any;
  code: number;
}

export async function nextTokenized<T>(
  method: string,
  url: string,
  config: AxiosRequestConfig,
  data?: any,
): Promise<ApiResponse<T>> {
  try {
    const response = await axiosApiInstance({
      method,
      url,
      data,
      ...config,
    });

    return {
      error: false,
      data: response.data,
      message: response.statusText,
      code: response.status,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const errorData = axiosError.response.data;
        return {
          error: true,
          data: null,
          message: errorData,
          code: axiosError.response.status,
        };
      }
    }

    return {
      error: true,
      data: null,
      message: "An unexpected error occurred",
      code: 500,
    };
  }
}
