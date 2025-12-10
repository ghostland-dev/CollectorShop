import { z } from 'zod';
import { apiClient as api } from './api';

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
}

export const purchaseService = {
  create: async (data: CreatePurchaseInput): Promise<{ message: string; purchase: Purchase }> => {
    const response = await api.post('/purchases', data);
    return response.data;
  },

  confirm: async (purchaseId: string): Promise<{ message: string; purchase: Purchase }> => {
    const response = await api.post(`/purchases/${purchaseId}/confirm`);
    return response.data;
  },

  getMyPurchases: async (): Promise<{ purchases: Purchase[] }> => {
    const response = await api.get('/purchases/me');
    return response.data;
  },
};
