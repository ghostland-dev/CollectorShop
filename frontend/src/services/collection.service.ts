import { apiClient } from './api';

export interface CollectionAnnouncement {
  id: string;
  title: string;
  price: number;
  images: string[];
  status: 'DRAFT' | 'PUBLISHED' | 'SOLD' | 'ARCHIVED';
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  image?: string;
  shopId: string;
  announcements?: CollectionAnnouncement[];
  itemCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionsResponse {
  collections: Collection[];
}

export interface Shop {
  id: string;
  name: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface CollectionDetail extends Collection {
  shop: Shop;
}

export interface CreateCollectionInput {
  name: string;
  description?: string;
  image?: string;
}

export interface UpdateCollectionInput extends CreateCollectionInput {}

class CollectionService {
  /**
   * Get all collections for a specific shop
   */
  async getShopCollections(shopId: string): Promise<Collection[]> {
    try {
      const response = await apiClient.get<CollectionsResponse>(
        `/collections/shop/${shopId}`
      );
      return response.collections || [];
    } catch (error) {
      console.error('Error fetching shop collections:', error);
      throw error;
    }
  }

  /**
   * Get collection details with announcements
   */
  async getCollection(collectionId: string): Promise<CollectionDetail> {
    try {
      const response = await apiClient.get<CollectionDetail>(
        `/collections/${collectionId}`
      );
      return response;
    } catch (error) {
      console.error('Error fetching collection:', error);
      throw error;
    }
  }

  /**
   * Create a new collection (seller only)
   */
  async createCollection(data: CreateCollectionInput): Promise<Collection> {
    try {
      const response = await apiClient.post<Collection>('/collections', data);
      return response;
    } catch (error) {
      console.error('Error creating collection:', error);
      throw error;
    }
  }

  /**
   * Update a collection (owner or admin only)
   */
  async updateCollection(
    collectionId: string,
    data: UpdateCollectionInput
  ): Promise<Collection> {
    try {
      const response = await apiClient.put<Collection>(
        `/collections/${collectionId}`,
        data
      );
      return response as any as Collection;
    } catch (error) {
      console.error('Error updating collection:', error);
      throw error;
    }
  }

  /**
   * Delete a collection (owner or admin only)
   */
  async deleteCollection(collectionId: string): Promise<void> {
    try {
      await apiClient.delete(`/collections/${collectionId}`);
    } catch (error) {
      console.error('Error deleting collection:', error);
      throw error;
    }
  }

  /**
   * Get seller's own collections
   */
  async getMyCollections(): Promise<Collection[]> {
    try {
      const response = await apiClient.get<CollectionsResponse>(
        '/collections/seller/my'
      );
      return (response as any as CollectionsResponse).collections || [];
    } catch (error) {
      console.error('Error fetching my collections:', error);
      throw error;
    }
  }
}

export const collectionService = new CollectionService();
