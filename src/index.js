import React from 'react';
import ReactDOM from 'react-dom/client'; // Corrected import
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css'; // Importing Bootstrap CSS
import './App.css'; // Import your custom styles
import App from './App';

// Use createRoot from 'react-dom/client'
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
