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

// Load initial state from localStorage if available
const loadState = (): ChatState => {
  try {
    const serializedState = localStorage.getItem('chatState');
    if (serializedState === null) {
      return {
        data: [],
        currentChatId: null
      };
    }
    const parsedState = JSON.parse(serializedState);
    // Convert string dates back to Date objects
    return {
      ...parsedState,
      data: parsedState.data.map((chat: Chat) => ({
        ...chat,
        createdAt: new Date(chat.createdAt),
        messages: chat.messages.map((message: Message) => ({
          ...message,
          createdAt: new Date(message.createdAt)
        }))
      }))
    };
  } catch (err) {
    console.error('Error loading chat state:', err);
    return {
      data: [],
      currentChatId: null
    };
  }
};

const initialState: ChatState = loadState();

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
      // Save to localStorage after adding new chat
      localStorage.setItem('chatState', JSON.stringify(state));
    },
    selectChat: (state, action: PayloadAction<string>) => {
      state.currentChatId = action.payload;
      // Save to localStorage after selecting chat
      localStorage.setItem('chatState', JSON.stringify(state));
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
        // Save to localStorage after adding messages
        localStorage.setItem('chatState', JSON.stringify(state));
      }
    },
    removeChat: (state, action: PayloadAction<string>) => {
      state.data = state.data.filter(chat => chat.id !== action.payload);
      if (state.currentChatId === action.payload) {
        state.currentChatId = state.data[0]?.id || null;
      }
      // Save to localStorage after removing chat
      localStorage.setItem('chatState', JSON.stringify(state));
    },
    updateChatTitle: (state, action: PayloadAction<{ chatId: string; title: string }>) => {
      const { chatId, title } = action.payload;
      const chat = state.data.find(chat => chat.id === chatId);
      if (chat) {
        chat.title = title;
        // Save to localStorage after updating title
        localStorage.setItem('chatState', JSON.stringify(state));
      }
    },
    clearChats: (state) => {
      state.data = [];
      state.currentChatId = null;
      // Clear localStorage
      localStorage.removeItem('chatState');
    }
  }
});

export const { addChat, selectChat, addMessage, removeChat, updateChatTitle, clearChats } = chatSlice.actions;
export default chatSlice.reducer; 