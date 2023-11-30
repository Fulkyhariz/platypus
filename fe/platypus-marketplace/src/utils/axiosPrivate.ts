import axios, { AxiosResponse, AxiosError } from "axios";
import { getCookie, setCookie } from "cookies-next";

interface ApiResponse<T> {
  error: boolean;
  data?: T | null;
  message: any;
  code: number;
}

export async function axiosPrivate<T>(
  method: string,
  url: string,
  config: any,
  data?: any,
): Promise<ApiResponse<T>> {
  const accessToken = getCookie("accessToken");
  const refreshToken = getCookie("refreshToken");
  try {
    const response: AxiosResponse<T> = await axios({
      method,
      url,
      data,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...config.headers,
      },
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
        if (axiosError.response.status === 401) {
          // Access token has expired, refresh it
          try {
            const newAccessToken = await refreshAccessToken(
              refreshToken as string,
            );
            setCookie("accessToken", newAccessToken);
            return axiosPrivate(method, url, config, data);
          } catch (refreshError) {
            return {
              error: true,
              data: null,
              message: "Failed to refresh access token",
              code: 500,
            };
          }
        } else {
          const errorData: any = axiosError.response.data;

          return {
            error: true,
            data: null,
            message: errorData,
            code: axiosError.response.status,
          };
        }
      }
    }

    return {
      error: true,
      data: null,
      message: "Server Error",
      code: 500,
    };
  }
}

async function refreshAccessToken(refreshToken: string): Promise<string> {
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

    // Extract the new access token from the response
    const newAccessToken = response.data.data.access_token;

    return newAccessToken;
  } catch (error) {
    throw error;
  }
}
