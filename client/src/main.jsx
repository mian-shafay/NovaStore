// =============================================
// MAIN.JSX — Application Entry Point
// =============================================
// This is the VERY FIRST file that runs.
// It renders the App component into the HTML page.
//
// StrictMode: A development tool that highlights potential
// problems in your app (like deprecated APIs).
// It does NOT affect production builds.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';

// Find the <div id="root"> in index.html and render our app into it
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* AuthProvider wraps the entire app so all components can access auth state */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
