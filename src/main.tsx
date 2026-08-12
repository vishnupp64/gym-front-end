import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { GymProvider } from './context/GymContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <GymProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </GymProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
);

