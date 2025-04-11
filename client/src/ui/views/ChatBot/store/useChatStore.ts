import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

interface ChatStore {
  chats: Chat[];
  currentChatId: string | null;
  createNewChat: () => void;
  setCurrentChatId: (id: string) => void;
  addMessage: (chatId: string, content: string, role: 'user' | 'assistant') => void;
  updateChatTitle: (chatId: string, title: string) => void;
  deleteChat: (chatId: string) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  chats: [],
  currentChatId: null,

  createNewChat: () => {
    const newChat: Chat = {
      id: uuidv4(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
    };
    set((state) => ({
      chats: [...state.chats, newChat],
      currentChatId: newChat.id,
    }));
  },

  setCurrentChatId: (id: string) => {
    set({ currentChatId: id });
  },

  addMessage: (chatId: string, content: string, role: 'user' | 'assistant') => {
    const newMessage: Message = {
      id: uuidv4(),
      content,
      role,
      timestamp: new Date(),
    };

    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId
          ? { ...chat, messages: [...chat.messages, newMessage] }
          : chat
      ),
    }));
  },

  updateChatTitle: (chatId: string, title: string) => {
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId ? { ...chat, title } : chat
      ),
    }));
  },

  deleteChat: (chatId: string) => {
    set((state) => ({
      chats: state.chats.filter((chat) => chat.id !== chatId),
      currentChatId:
        state.currentChatId === chatId ? null : state.currentChatId,
    }));
  },
})); 