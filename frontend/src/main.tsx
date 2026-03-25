import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import DashboardApp from './DashboardApp';
import './index.css';

// Check URL path to determine which app to render
const isDashboard = window.location.pathname.startsWith('/dashboard');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isDashboard ? <DashboardApp /> : <App />}
  </React.StrictMode>,
);

