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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
    <Header/>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/ml" element={<MachineLearning />} />
        <Route path="/chat" element={<ChatBot />} />
        {/* <Route path="/settings" element={<Settings />} /> */}
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
