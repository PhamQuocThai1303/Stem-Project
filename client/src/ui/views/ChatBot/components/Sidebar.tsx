import React from 'react';
import { Chat, removeChat } from '../store/chatSlice';
import { useDispatch } from 'react-redux';

interface SidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chats,
  currentChatId,
  onNewChat,
  onSelectChat,
}) => {
  const dispatch = useDispatch();

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(removeChat(chatId));
  };

  return (
    <div className="sidebar">
      <button
        onClick={onNewChat}
        className="new-chat-button"
      >
        + Cuộc trò chuyện mới
      </button>

      <div className="chat-list">
        <div className="recent-chats">
          <h3>Gần đây:</h3>
          {chats?.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${currentChatId === chat.id ? 'active' : ''}`}
              onClick={() => onSelectChat(chat.id)}
            >
              <div className="chat-item-content">
                <span className="chat-title">{chat.title}</span>
                <button
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                  className="delete-chat-button"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 