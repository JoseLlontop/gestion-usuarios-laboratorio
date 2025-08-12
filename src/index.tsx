import { CssBaseline } from '@mui/material';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import { store } from './redux/store';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './context/AuthContext'; 
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <CssBaseline />
        <App />
      </AuthProvider>
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
