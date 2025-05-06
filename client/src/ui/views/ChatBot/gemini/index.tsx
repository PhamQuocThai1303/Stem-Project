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

export const generateResponseWithImage = async (prompt: string, imageFile: File, history: ChatHistory = []) => {
  try {
    // Sử dụng cùng một model flash cho xử lý hình ảnh thay vì model vision riêng biệt
    // vì gemini-2.0-flash cũng hỗ trợ xử lý multimodal
    
    // Chuyển đổi file thành định dạng phù hợp cho Gemini
    const imageData = await fileToGenerativePart(imageFile);
    
    // Format chat history for Gemini (chỉ sử dụng history text, không kèm ảnh cũ)
    const formattedHistory: GeminiMessage[] = history.map(msg => ({
      role: msg.isBot ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));
    
    // Gửi cả tin nhắn và hình ảnh
    const result = await model.generateContent([
      ...formattedHistory.flatMap(msg => msg.parts), // Thêm lịch sử trò chuyện
      { text: prompt }, // Thêm prompt hiện tại
      imageData // Thêm hình ảnh
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

// Hàm chuyển đổi File thành định dạng phù hợp cho Gemini API
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