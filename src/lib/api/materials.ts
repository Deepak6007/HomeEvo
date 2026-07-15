import apiClient from "./client";
import { Product, Cart, MaterialOrder, ApiResponse } from "@/types";

export const materialsApi = {
  list: async (filters?: { category?: string; search?: string; page?: number }): Promise<ApiResponse<Product[]>> => {
    const response = await apiClient.get<ApiResponse<Product[]>>("/materials/products", {
      params: filters,
    });
    return response.data;
  },

  get: async (id: string): Promise<Product> => {
    const response = await apiClient.get<ApiResponse<Product>>(`/materials/products/${id}`);
    return response.data.data;
  },

  addToCart: async (productId: string, quantity: number): Promise<Cart> => {
    const response = await apiClient.post<ApiResponse<Cart>>("/materials/cart", {
      productId,
      quantity,
    });
    return response.data.data;
  },

  getCart: async (): Promise<Cart> => {
    const response = await apiClient.get<ApiResponse<Cart>>("/materials/cart");
    return response.data.data;
  },

  checkout: async (
    items: { productId: string; quantity: number }[],
    deliveryAddress: string
  ): Promise<MaterialOrder> => {
    const response = await apiClient.post<ApiResponse<MaterialOrder>>("/materials/checkout", {
      items,
      deliveryAddress,
    });
    return response.data.data;
  },
};
