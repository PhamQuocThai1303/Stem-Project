import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatHistory, GeminiMessage, GenerationConfig } from './types';
import { processResponse } from './utils';

const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
if (!apiKey) {
  throw new Error('VITE_GOOGLE_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);

const defaultConfig: GenerationConfig = {
  maxOutputTokens: 2048,
  temperature: 1,
  topP: 0.95,
  topK: 64,
};

// Khởi tạo model một lần
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export const generateResponse = async (prompt: string, history: ChatHistory = []) => {
  try {
    // Format chat history for Gemini
    const formattedHistory: GeminiMessage[] = history.map(msg => ({
      role: msg.isBot ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    formattedHistory.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    // Khởi tạo chat với lịch sử
    const chat = model.startChat({
      history: formattedHistory.slice(0, -1), // Không bao gồm prompt hiện tại trong history
      generationConfig: defaultConfig,
    });

    // Gửi tin nhắn mới
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();
    
    return processResponse(text);
  } catch (error) {
    console.error('Error generating response:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to generate response. Please try again.');
  }
}; 