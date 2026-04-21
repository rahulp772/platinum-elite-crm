import { api } from './api';

export interface ConversationResponse {
  id: string;
  participants: Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
  }>;
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    timestamp: Date;
    read: boolean;
  };
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageResponse {
  id: string;
  content: string;
  senderId: string;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
  conversationId?: string;
  timestamp: Date;
  read: boolean;
}

export interface PaginatedMessagesResponse {
  messages: MessageResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const chatApi = {
  getConversations: async (): Promise<ConversationResponse[]> => {
    try {
      const response = await api.get('/chat/conversations');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch conversations:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch conversations');
    }
  },

  getMessages: async (conversationId: string, page: number = 1, limit: number = 50): Promise<PaginatedMessagesResponse> => {
    try {
      const response = await api.get(`/chat/conversations/${conversationId}/messages`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch messages:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch messages');
    }
  },

  sendMessage: async (conversationId: string, content: string): Promise<MessageResponse> => {
    try {
      const response = await api.post(`/chat/conversations/${conversationId}/messages`, { content });
      return response.data;
    } catch (error: any) {
      console.error('Failed to send message:', error);
      throw new Error(error.response?.data?.message || 'Failed to send message');
    }
  },

  createConversation: async (participantIds: string[]): Promise<ConversationResponse> => {
    try {
      const response = await api.post('/chat/conversations', { participantIds });
      return response.data;
    } catch (error: any) {
      console.error('Failed to create conversation:', error);
      throw new Error(error.response?.data?.message || 'Failed to create conversation');
    }
  },
};