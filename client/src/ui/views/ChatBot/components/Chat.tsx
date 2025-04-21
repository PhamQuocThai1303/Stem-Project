import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useTranslation } from 'react-i18next';
interface ChatProps {
  chatId: string;
}

export const Chat: React.FC<ChatProps> = ({ chatId }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { chats, addMessage } = useChatStore();
  const {t} = useTranslation()
  const chat = chats.find((c) => c.id === chatId);
  if (!chat) return null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    addMessage(chatId, input, 'user');

    // Clear input
    setInput('');

    try {
      // Here you would typically make an API call to your backend
      // For now, we'll just simulate a response
      const response = `This is a simulated response to: "${input}"`;
      
      // Add assistant message after a short delay
      setTimeout(() => {
        addMessage(chatId, response, 'assistant');
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage(
        chatId,
        'Sorry, there was an error processing your message.',
        'assistant'
      );
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {chat.messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${
              message.role === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {message.content}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("Type your message...")}
            className="flex-1 p-2 border rounded-l focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
          >
            {t("Send")}
          </button>
        </div>
      </form>
    </div>
  );
}; 