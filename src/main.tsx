import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster 
      position="top-center"
      toastOptions={{
        style: {
          background: '#1c1c1e',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
        },
      }}
    />
  </StrictMode>,
)
