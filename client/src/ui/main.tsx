import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './views/Stem/App.tsx'
import '../configs/i18n'
import "bootstrap/dist/css/bootstrap.min.css";
import MachineLearning from './views/MachineLearning/index.tsx'
import ChatBot from './views/ChatBot/ChatBot.tsx'
import Header from './@core/components/header/index.tsx'
import Login from './views/Login/index.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import GlobalToast from './@core/components/Toast/GlobalToast.tsx'
import Setting from './views/Setting/index.tsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import PrivateRoute from './@core/components/privateRoute/PrivateRoute.tsx'

const MainContent = () => {
  const [currentTab, setCurrentTab] = useState('stem');

  const renderContent = () => {
    switch (currentTab) {
      case 'stem':
        return <App />;
      case 'ml':
        return <MachineLearning />;
      case 'chat':
        return <ChatBot />;
      case 'settings':
        return <Setting />;
      default:
        return <App />;
    }
  };

  return (
    <>
      <Header currentTab={currentTab} onTabChange={setCurrentTab} />
      {renderContent()}
      <GlobalToast />
    </>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute element={<MainContent />} />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)