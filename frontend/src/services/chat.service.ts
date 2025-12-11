import { apiClient } from './api';

export interface Conversation {
  id: string;
  user1: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  user2: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  announcement?: {
    id: string;
    title: string;
    price: number;
    images: string[];
  };
  lastMessageAt?: string;
  messages?: Message[];
}

export interface Message {
  id: string;
  conversationId: string;
  sender: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  receiver: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  content: string;
  read: boolean;
  createdAt: string;
}

export interface CreateMessageInput {
  receiverId: string;
  announcementId?: string;
  content: string;
}

export interface CreateConversationInput {
  receiverId: string;
  announcementId?: string;
}

export interface MessagesResponse {
  messages: Message[];
  total: number;
  page: number;
  limit: number;
}

export const chatService = {
  getConversations: async (): Promise<{ conversations: Conversation[] }> => {
    const response = await apiClient.get<{ conversations: Conversation[] }>('/chat/conversations');
    return response.data;
  },

  createConversation: async (data: CreateConversationInput): Promise<{ conversation: Conversation }> => {
    const response = await apiClient.post<{ conversation: Conversation }>('/chat/conversations', data);
    return response.data;
  },

  getMessages: async (conversationId: string, page = 1, limit = 50): Promise<MessagesResponse> => {
    const response = await apiClient.get<MessagesResponse>(`/chat/conversations/${conversationId}/messages`, {
      params: { page, limit },
    });
    return response.data;
  },

  sendMessage: async (data: CreateMessageInput): Promise<{ message: Message }> => {
    const response = await apiClient.post<{ message: Message }>('/chat/messages', data);
    return response.data;
  },

  getUnreadCount: async (): Promise<{ unreadCount: number }> => {
    const response = await apiClient.get<{ unreadCount: number }>('/chat/messages/unread-count');
    return response.data;
  },
};

