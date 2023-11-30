import { useLoading } from "@/store/loading/useLoading";
import axios, { AxiosResponse, AxiosError, AxiosRequestConfig } from "axios";

export const handleNextApiRequest = async <T>(
  endpoint: string,
  method: string,
  token: string = "",
  data: Record<string, any> | undefined = undefined,
): Promise<{ success: boolean; data?: T; error?: string; code?: number }> => {
  const { showLoading, hideLoading } = useLoading.getState();

  try {
    showLoading();

    const axiosConfig: AxiosRequestConfig = {
      method,
      url: endpoint,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `${token}` : "",
      },
      data,
    };

    const response: AxiosResponse<T> = await axios(axiosConfig);
    hideLoading();

    return { success: true, data: response.data, code: response.status };
  } catch (error) {
    hideLoading();

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const errorData: any = axiosError.response.data;

        return {
          success: false,
          error: errorData.error,
          code: axiosError.response.status,
        };
      }
    }
    const axiosError = error as AxiosError;

    return {
      success: false,
      error: String(error),
      code: axiosError.response?.status,
    };
  }
};
