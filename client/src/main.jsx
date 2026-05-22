import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import App from './App';
import './styles/global.css';
import './styles/themes.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background:   'var(--bg-surface)',
              color:        'var(--text-primary)',
              border:       '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              boxShadow:    'var(--shadow-lg)',
              fontSize:     'var(--text-sm)',
              fontFamily:   'var(--font-body)',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);