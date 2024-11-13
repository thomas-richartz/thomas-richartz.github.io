import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

if (process.env.NODE_ENV !== 'development' && window.location.protocol === 'http:') {
  window.location.href = window.location.href.replace(/^http:/, 'https:');
}

// console.log(process.env);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

