import { apiClient } from './api';

export interface Shop {
  id: string;
  name: string;
  description?: string;
  userId: string;
  logo?: string;
  bannerImage?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface ShopsResponse {
  shops: Shop[];
  total: number;
}

export const shopService = {
  getById: async (shopId: string): Promise<Shop> => {
    try {
      const response = await apiClient.get<Shop>(`/shops/${shopId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la boutique:', error);
      throw error;
    }
  },

  getByUserId: async (userId: string): Promise<Shop | null> => {
    try {
      const response = await apiClient.get<Shop>(`/shops/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la boutique utilisateur:', error);
      return null;
    }
  },

  getAll: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<ShopsResponse> => {
    try {
      const response = await apiClient.get<ShopsResponse>('/shops', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des boutiques:', error);
      throw error;
    }
  },

  update: async (shopId: string, data: Partial<Shop>): Promise<Shop> => {
    try {
      const response = await apiClient.put<Shop>(`/shops/${shopId}`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la boutique:', error);
      throw error;
    }
  },
};
