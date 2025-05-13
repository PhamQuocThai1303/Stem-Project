import { useState, useEffect, useRef, KeyboardEvent, ChangeEvent } from "react";
import { Provider, useDispatch, useSelector } from 'react-redux';
import { generateResponse, generateResponseWithImage } from "./gemini";
import { RootState } from './store/store';
import { addMessage, addChat, selectChat } from './store/chatSlice';
import { store } from './store/store';
import { Sidebar }  from './components/Sidebar';
import "./index.css";
import { useTranslation } from 'react-i18next';



const ChatBotContent = () => {
  const dispatch = useDispatch();
  const { data: chats, currentChatId } = useSelector((state: RootState) => state.chat);
  const currentChat = chats.find((chat) => chat.id === currentChatId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {t} = useTranslation()
  const [inputChat, setInputChat] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        return; 
      } else {
        e.preventDefault();
        if (!isLoading && inputChat.trim()) {
          handleChat();
        }
      }
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setImageFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; 
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${scrollHeight}px`;
    }
  };

  // Adjust height whenever input changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [inputChat]);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputChat(e.target.value);
  };

  const handleChat = async () => {
    if ((!inputChat.trim() && !uploadedImage) || isLoading) return;


    if (!currentChatId || !currentChat) {
      dispatch(addChat());
      
      const newChatId = store.getState().chat.currentChatId;
      if (!newChatId) return;
      
      setIsLoading(true);
      try {
        const userInput = inputChat.trim();
        setInputChat(""); 
        
        let botResponse;
        let displayUserMessage = userInput;
        
        if (uploadedImage && imageFile) {
          botResponse = await generateResponseWithImage(userInput, imageFile, []);
          // Tạo HTML để hiển thị tin nhắn của người dùng kèm hình ảnh
          displayUserMessage = `<div>${userInput}<div class="uploaded-image-container"><img src="${uploadedImage}" alt="Uploaded" class="message-image" /></div></div>`;
        } else {
          botResponse = await generateResponse(userInput, []);
        }
        
        dispatch(addMessage({
          chatId: newChatId,
          userMessage: displayUserMessage,
          botMessage: botResponse
        }));
        
        setUploadedImage(null);
        setImageFile(null);
      } catch (error) {
        console.error('Error in chat:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(true);
      try {
        const userInput = inputChat.trim();
        setInputChat(""); 
        
        let botResponse;
        let displayUserMessage = userInput;
        
        if (uploadedImage && imageFile) {
          botResponse = await generateResponseWithImage(userInput, imageFile, currentChat.messages);
          // Tạo HTML để hiển thị tin nhắn của người dùng kèm hình ảnh
          displayUserMessage = `<div>${userInput}<div class="uploaded-image-container"><img src="${uploadedImage}" alt="Uploaded" class="message-image" /></div></div>`;
        } else {
          botResponse = await generateResponse(userInput, currentChat.messages);
        }
        
        dispatch(addMessage({
          chatId: currentChatId,
          userMessage: displayUserMessage,
          botMessage: botResponse
        }));
        
        setUploadedImage(null);
        setImageFile(null);
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
                <h2 className="gradient-text">{t("Hello")}</h2>
                <p className="welcome-subtext">{t("What can I help you with today")}</p>
              </div>
              <div className="suggestion-grid">
                <div className="suggestion-card" onClick={() => handleSuggestionClick("STEM là gì?")}>
                  <p>{t("What is STEM?")}</p>
                </div>
                <div className="suggestion-card" onClick={() => handleSuggestionClick("Machine Learning là gì?")}>
                  <p>{t("What is Machine Learning?")}</p>
                </div>
                <div className="suggestion-card" onClick={() => handleSuggestionClick("Lộ trình học STEM và Machine Learning")}>
                  <p>{t("The STEM and Machine Learning learning path")}</p>
                </div>
                <div className="suggestion-card" onClick={() => handleSuggestionClick("Các nguồn học hiệu quả cho STEM và Machine Learning")}>
                  <p>{t("Effective learning sources for STEM and Machine Learning")}</p>
                </div>
              </div>
            </div>
          )}

          <div className="chatbot-input">
            {uploadedImage && (
              <div className="image-preview">
                <img src={uploadedImage} alt="Preview" />
                <button className="remove-image-btn" onClick={handleRemoveImage}>×</button>
              </div>
            )}
            <div className="input-container">
              <button
                className="attach-button"
                onClick={handleAttachClick}
                title={t("Attach an image")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                </svg>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <textarea
                ref={textareaRef}
                value={inputChat}
                placeholder={t("Enter your question here")}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
                rows={1}
                className="chat-input"
              />
              <button 
                onClick={handleChat}
                disabled={isLoading || (!inputChat.trim() && !uploadedImage)}
                className="send-button"
              >
                {t("Send")}
              </button>
            </div>
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