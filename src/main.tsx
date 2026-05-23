import React from 'react';
import ReactDOM from 'react-dom/client';
import Keycloak from 'keycloak-js';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './app/globals.css';

// Keycloak JS Client setup
// Connects to local keycloak running on host port 8088 in developer mode
const keycloak = new Keycloak({
  url: window.location.origin.includes('localhost') ? 'http://localhost:8088' : `${window.location.origin}/auth`,
  realm: 'velox',
  clientId: 'velox-frontend',
});

keycloak.init({
  onLoad: 'check-sso',
  checkLoginIframe: false,
  pkceMethod: 'S256'
}).then((authenticated) => {
  // Bind keycloak to window for global access
  (window as any).keycloak = keycloak;

  if (authenticated) {
    console.log('✅ Keycloak authenticated successfully');
    localStorage.setItem('velox_access_token', keycloak.token || '');
    localStorage.setItem('velox_authenticated', 'true');
    
    if (keycloak.tokenParsed) {
      const preferredUsername = (keycloak.tokenParsed as any).preferred_username || '';
      const fullName = (keycloak.tokenParsed as any).name || '';
      const employeeId = (keycloak.tokenParsed as any).employeeId || '';
      
      localStorage.setItem('velox_user_username', preferredUsername);
      localStorage.setItem('velox_user_name', fullName);
      localStorage.setItem('velox_user_empid', employeeId);

      // Check if user is Admin
      let adminRole = false;
      const realmAccess = (keycloak.tokenParsed as any).realm_access;
      if (realmAccess && realmAccess.roles) {
        adminRole = realmAccess.roles.includes('admin');
      }
      if (preferredUsername === 'admin') {
        adminRole = true;
      }
      localStorage.setItem('isAdmin', adminRole ? 'true' : 'false');
    }

    // Refresh token 30 seconds before expiration
    setInterval(() => {
      keycloak.updateToken(30).then((refreshed) => {
        if (refreshed) {
          localStorage.setItem('velox_access_token', keycloak.token || '');
        }
      }).catch((err) => {
        console.error('Failed to refresh Keycloak token', err);
      });
    }, 10000);
  } else {
    console.log('ℹ️ Keycloak running in public/unauthenticated mode');
    localStorage.removeItem('velox_access_token');
    localStorage.removeItem('velox_authenticated');
    localStorage.removeItem('velox_user_username');
    localStorage.removeItem('velox_user_name');
    localStorage.removeItem('velox_user_empid');
    localStorage.setItem('isAdmin', 'false');
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}).catch((err) => {
  console.error('❌ Keycloak initialization error', err);
  
  // Clean fallback page if Keycloak is down or unreachable
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6 text-center">
      <div className="w-16 h-16 bg-red-950/50 border border-red-500/30 rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0-6h.01M5.071 19.071c-4.14-4.14-4.14-10.858 0-15 4.14-4.14 10.858-4.14 15 0 4.14 4.14 4.14 10.858 0 15-4.14 4.14-10.858 4.14-15 0z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-red-500 mb-2">SSO Authentication Unreachable</h1>
      <p className="text-slate-400 max-w-sm mb-6">The Keycloak authentication server is currently offline or unreachable.</p>
      <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-sm font-medium transition-all shadow-md">
        Retry SSO Connection
      </button>
    </div>
  );
});
