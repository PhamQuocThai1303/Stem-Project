import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  text: string;
  isBot: boolean;
  createdAt: Date;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

interface ChatState {
  data: Chat[];
  currentChatId: string | null;
}

const initialState: ChatState = {
  data: [],
  currentChatId: null
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addChat: (state) => {
      const newChat = {
        id: uuidv4(),
        title: 'Chat mới',
        messages: [],
        createdAt: new Date()
      };
      state.data.push(newChat);
      state.currentChatId = newChat.id;
    },
    selectChat: (state, action: PayloadAction<string>) => {
      state.currentChatId = action.payload;
    },
    addMessage: (state, action: PayloadAction<{ chatId: string; userMessage: string; botMessage: string }>) => {
      const { chatId, userMessage, botMessage } = action.payload;
      const chat = state.data.find(chat => chat.id === chatId);
      if (chat) {
        if (chat.messages.length === 0) {
          chat.title = userMessage.length > 30 
            ? userMessage.substring(0, 30) + '...'
            : userMessage;
        }
        
        chat.messages.push(
          { id: uuidv4(), text: userMessage, isBot: false, createdAt: new Date() },
          { id: uuidv4(), text: botMessage, isBot: true, createdAt: new Date() }
        );
      }
    },
    removeChat: (state, action: PayloadAction<string>) => {
      state.data = state.data.filter(chat => chat.id !== action.payload);
      if (state.currentChatId === action.payload) {
        state.currentChatId = state.data[0]?.id || null;
      }
    },
    updateChatTitle: (state, action: PayloadAction<{ chatId: string; title: string }>) => {
      const { chatId, title } = action.payload;
      const chat = state.data.find(chat => chat.id === chatId);
      if (chat) {
        chat.title = title;
      }
    }
  }
});

export const { addChat, selectChat, addMessage, removeChat, updateChatTitle } = chatSlice.actions;
export default chatSlice.reducer; 