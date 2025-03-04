import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './views/Stem/App.tsx'
import '../configs/i18n'
import "bootstrap/dist/css/bootstrap.min.css";
import { Route, Routes } from 'react-router-dom'
import { BrowserRouter } from "react-router";
import MachineLearning from './views/MachineLearning/index.tsx'
import ChatBot from './views/ChatBot/index.tsx'
import Header from './@core/components/header/index.tsx'
import Login from './views/Login/index.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import PrivateRoute from './@core/components/privateRoute/PrivateRoute.tsx'
import GlobalToast from './@core/components/Toast/GlobalToast.tsx'
import Setting from './views/Setting/index.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
    <BrowserRouter>
    <Header/>
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute element={<App />} />} />
        <Route path="/ml" element={<PrivateRoute element={<MachineLearning />} />} />
        <Route path="/chat" element={<PrivateRoute element={<ChatBot />} />} />
        <Route path="/settings" element={<PrivateRoute element={<Setting />} />} />
        {/* <Route path="/settings" element={<Settings />} /> */}
      </Routes>
      <GlobalToast />
    </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
