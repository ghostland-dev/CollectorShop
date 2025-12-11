import { apiClient, ApiError } from './api';
import { z } from 'zod';

export const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().min(1, 'La description est requise'),
  price: z.number().positive('Le prix doit être positif'),
  category: z.string().optional(),
  images: z.array(z.string().url().or(z.string().min(1))).default([]),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;

export interface Announcement {
  id: string;
  title: string;
  description: string;
  price: number;
  status: 'DRAFT' | 'PUBLISHED' | 'SOLD' | 'ARCHIVED';
  sellerId: string;
  category?: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  seller?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface AnnouncementsResponse {
  announcements: Announcement[];
  total: number;
  page: number;
  limit: number;
}

export const announcementService = {
  getAll: async (params?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<AnnouncementsResponse> => {
    try {
      const response = await apiClient.get<AnnouncementsResponse>('/announcements', { params });
      
      // Vérifier que la réponse a le bon format
      if (!response.data || !Array.isArray(response.data.announcements)) {
        console.error('Format de réponse invalide:', response.data);
        throw new Error('Format de réponse invalide de l\'API');
      }
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des annonces:', error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new Error(error instanceof Error ? error.message : 'Erreur lors du chargement des annonces');
    }
  },

  getById: async (id: string): Promise<Announcement> => {
    const response = await apiClient.get<Announcement>(`/announcements/${id}`);
    return response.data;
  },

  getMyAnnouncements: async (): Promise<{ announcements: Announcement[] }> => {
    const response = await apiClient.get<{ announcements: Announcement[] }>('/announcements/me');
    return response.data;
  },

  create: async (data: CreateAnnouncementInput): Promise<Announcement> => {
    const response = await apiClient.post<{ message: string; announcement: Announcement }>('/announcements', data);
    return response.data.announcement;
  },

  update: async (id: string, data: Partial<CreateAnnouncementInput>): Promise<Announcement> => {
    const response = await apiClient.put<Announcement>(`/announcements/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/announcements/${id}`);
  },
};
