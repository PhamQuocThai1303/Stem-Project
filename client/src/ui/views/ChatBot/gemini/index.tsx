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

const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export const generateResponse = async (prompt: string, history: ChatHistory = []) => {
  try {
    const formattedHistory: GeminiMessage[] = history.map(msg => ({
      role: msg.isBot ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    formattedHistory.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const chat = model.startChat({
      history: formattedHistory.slice(0, -1),
      generationConfig: defaultConfig,
    });

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

export const generateResponseWithImage = async (prompt: string, imageFile: File, history: ChatHistory = []) => {
  try {
    
    // Chuyển đổi file thành định dạng phù hợp
    const imageData = await fileToGenerativePart(imageFile);
    
    const formattedHistory: GeminiMessage[] = history.map(msg => ({
      role: msg.isBot ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));
    
    const result = await model.generateContent([
      ...formattedHistory.flatMap(msg => msg.parts), 
      { text: prompt },
      imageData 
    ]);
    
    const response = await result.response;
    const text = response.text();
    
    return processResponse(text);
  } catch (error) {
    console.error('Error generating response with image:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to generate response with image. Please try again.');
  }
};

const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string, mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // Chuyển đổi kết quả từ FileReader thành base64 string (bỏ phần tiền tố data:image/*;base64,)
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type
        }
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}; 