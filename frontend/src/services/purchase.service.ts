import { z } from 'zod';
import { apiClient } from './api';

export const createPurchaseSchema = z.object({
  announcementId: z.string().uuid(),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;

export interface Purchase {
  id: string;
  announcementId: string;
  buyerId: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  deliveryStatus: 'PENDING' | 'PREPARING' | 'SHIPPED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
  announcement?: {
    id: string;
    title: string;
    description: string;
    price: number;
    images: string[];
    seller?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
  };
  buyer?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

export const purchaseService = {
  create: async (data: CreatePurchaseInput): Promise<{ message: string; purchase: Purchase }> => {
    const response = await apiClient.post<{ message: string; purchase: Purchase }>('/purchases', data);
    return response.data;
  },

  confirm: async (purchaseId: string): Promise<{ message: string; purchase: Purchase }> => {
    const response = await apiClient.post<{ message: string; purchase: Purchase }>(`/purchases/${purchaseId}/confirm`);
    return response.data;
  },

  getMyPurchases: async (): Promise<{ purchases: Purchase[] }> => {
    const response = await apiClient.get<{ purchases: Purchase[] }>('/purchases/me');
    return response.data;
  },

  getMySales: async (): Promise<{ purchases: Purchase[] }> => {
    const response = await apiClient.get<{ purchases: Purchase[] }>('/purchases/sales');
    return response.data;
  },

  updateDeliveryStatus: async (
    purchaseId: string,
    data: { deliveryStatus: string; trackingNumber?: string }
  ): Promise<{ message: string; purchase: Purchase }> => {
    const response = await apiClient.patch<{ message: string; purchase: Purchase }>(`/purchases/${purchaseId}/delivery-status`, data);
    return response.data;
  },
};
