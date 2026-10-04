// طبقة رفيعة فوق axios: بترجّع الـ data مباشرة. كل الـ actions بتستخدمها (مش axios).
import type { AxiosRequestConfig } from "axios";
import { axiosInstance } from "./axios-instance";

class ApiClient {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return (await axiosInstance.get<T>(url, config)).data;
  }

  async post<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    return (await axiosInstance.post<T>(url, data, config)).data;
  }

  async put<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    return (await axiosInstance.put<T>(url, data, config)).data;
  }

  async patch<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    return (await axiosInstance.patch<T>(url, data, config)).data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return (await axiosInstance.delete<T>(url, config)).data;
  }
}

export const apiClient = new ApiClient();
