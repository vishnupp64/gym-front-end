import api from './api';
import type { ApiResponse } from '../types';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const chatService = {
  send: (messages: ChatMessage[]) =>
    api
      .post<ApiResponse<{ reply: string }>>('/chat', { messages })
      .then((r) => r.data),
};
