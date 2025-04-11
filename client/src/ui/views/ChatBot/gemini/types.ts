import { Message } from '../store/chatSlice';

export type ChatHistory = Message[];

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface GenerationConfig {
  maxOutputTokens: number;
  temperature: number;
  topP: number;
  topK: number;
} 