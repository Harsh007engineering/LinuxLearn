import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#161b22',
            color: '#e6edf3',
            border: '1px solid #30363d',
            borderRadius: '10px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px'
          },
          success: {
            iconTheme: { primary: '#3fb950', secondary: '#0d1117' },
            duration: 3000
          },
          error: {
            iconTheme: { primary: '#f85149', secondary: '#0d1117' },
            duration: 4000
          }
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
