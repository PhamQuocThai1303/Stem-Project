import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { Provider, useDispatch, useSelector } from 'react-redux';
import { generateResponse } from "./gemini";
import { RootState } from './store/store';
import { addMessage, addChat, selectChat } from './store/chatSlice';
import { store } from './store/store';
import { Sidebar }  from './components/Sidebar';
import "./index.css";

const ChatBotContent = () => {
  const dispatch = useDispatch();
  const { data: chats, currentChatId } = useSelector((state: RootState) => state.chat);
  const currentChat = chats.find((chat) => chat.id === currentChatId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [inputChat, setInputChat] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages, isLoading]);

  const handleNewChat = () => {
    dispatch(addChat());
  };

  const handleSelectChat = (chatId: string) => {
    dispatch(selectChat(chatId));
  };

  const handleSuggestionClick = async (suggestion: string) => {
    if (!currentChatId || !currentChat) {
      dispatch(addChat());
      // Lấy ID của chat mới vừa tạo
      const newChatId = store.getState().chat.currentChatId;
      if (!newChatId) return;
      
      setIsLoading(true);
      try {
        const botResponse = await generateResponse(suggestion, []);
        dispatch(addMessage({
          chatId: newChatId,
          userMessage: suggestion,
          botMessage: botResponse
        }));
      } catch (error) {
        console.error('Error in chat:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(true);
      try {
        const botResponse = await generateResponse(suggestion, currentChat.messages);
        dispatch(addMessage({
          chatId: currentChatId,
          userMessage: suggestion,
          botMessage: botResponse
        }));
      } catch (error) {
        console.error('Error in chat:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading && inputChat.trim()) {
      handleChat();
    }
  };

  const handleChat = async () => {
    if (!inputChat.trim() || isLoading) return;

    // Nếu chưa có chat nào hoặc chưa chọn chat nào, tạo chat mới
    if (!currentChatId || !currentChat) {
      dispatch(addChat());
      // Lấy ID của chat mới vừa tạo
      const newChatId = store.getState().chat.currentChatId;
      if (!newChatId) return;
      
      setIsLoading(true);
      try {
        const userInput = inputChat.trim();
        setInputChat(""); // Clear input ngay khi bắt đầu xử lý
        
        const botResponse = await generateResponse(userInput, []);
        dispatch(addMessage({
          chatId: newChatId,
          userMessage: userInput,
          botMessage: botResponse
        }));
      } catch (error) {
        console.error('Error in chat:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(true);
      try {
        const userInput = inputChat.trim();
        setInputChat(""); // Clear input ngay khi bắt đầu xử lý
        
        const botResponse = await generateResponse(userInput, currentChat.messages);
        dispatch(addMessage({
          chatId: currentChatId,
          userMessage: userInput,
          botMessage: botResponse
        }));
      } catch (error) {
        console.error('Error in chat:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="chat-layout">
      <Sidebar 
        chats={chats}
        currentChatId={currentChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
      />
      <div className="chatbot-container">
      <div className="chatbot-header">
          <h1 className="chatbot-title">Chat Bot</h1>
        </div>


        <div className="chatbot-content">
          {currentChat?.messages.length ? (
            <div className="chatbot-messages">
              {currentChat.messages.map((message) => (
                <div key={message.id} className={`message ${message.isBot ? 'bot' : 'user'}`}>
                  <div className="message-content">
                    <p dangerouslySetInnerHTML={{ __html: message.text }} />
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="message bot">
                  <div className="chat-loading">
                    <div className="bubble"></div>
                    <div className="bubble"></div>
                    <div className="bubble"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="welcome-screen">
              <div className="welcome-text">
                <h2 className="gradient-text">Xin Chào</h2>
                <p className="welcome-subtext">Hôm nay tôi có thể giúp gì cho bạn</p>
              </div>
              <div className="suggestion-grid">
                <div className="suggestion-card" onClick={() => handleSuggestionClick("STEM là gì?")}>
                  <p>STEM là gì?</p>
                </div>
                <div className="suggestion-card" onClick={() => handleSuggestionClick("Machine Learning là gì?")}>
                  <p>Machine Learning là gì?</p>
                </div>
                <div className="suggestion-card" onClick={() => handleSuggestionClick("Lộ trình học STEM và Machine Learning")}>
                  <p>Lộ trình học STEM và Machine Learning</p>
                </div>
                <div className="suggestion-card" onClick={() => handleSuggestionClick("Các nguồn học hiệu quả cho STEM và Machine Learning")}>
                  <p>Các nguồn học hiệu quả cho STEM và Machine Learning</p>
                </div>
              </div>
            </div>
          )}

          <div className="chatbot-input">
            <input
              type="text"
              value={inputChat}
              placeholder="Nhập câu lệnh tại đây"
              onChange={(e) => setInputChat(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <button 
              onClick={handleChat}
              disabled={isLoading || !inputChat.trim()}
              className="send-button"
            >
              Gửi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatBot = () => {
  return (
    <Provider store={store}>
      <ChatBotContent />
    </Provider>
  );
};

export default ChatBot; 