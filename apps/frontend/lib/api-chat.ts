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

export const chatApi = {
  getConversations: async (): Promise<ConversationResponse[]> => {
    const response = await api.get('/chat/conversations');
    return response.data;
  },

  getMessages: async (conversationId: string): Promise<MessageResponse[]> => {
    const response = await api.get(`/chat/conversations/${conversationId}/messages`);
    return response.data;
  },

  sendMessage: async (conversationId: string, content: string): Promise<MessageResponse> => {
    const response = await api.post(`/chat/conversations/${conversationId}/messages`, { content });
    return response.data;
  },

  createConversation: async (participantIds: string[]): Promise<ConversationResponse> => {
    const response = await api.post('/chat/conversations', { participantIds });
    return response.data;
  },
};