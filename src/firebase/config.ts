import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Validate required environment variables
const requiredEnvVars = {
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  const errorMessage = `
    ⚠️ Firebase Configuration Error ⚠️
    
    Missing required environment variables:
    ${missingVars.map(v => `  - ${v}`).join('\n')}
    
    Please ensure your .env file exists and contains all required Firebase configuration values.
    
    Steps to fix:
    1. Check that .env file exists in the project root
    2. Verify all VITE_FIREBASE_* variables are set
    3. Restart the development server (npm run dev)
    
    See .env.example for reference.
  `;
  
  console.error(errorMessage);
  
  // Show user-friendly error in the UI
  document.body.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 20px;
    ">
      <div style="
        background: white;
        border-radius: 16px;
        padding: 40px;
        max-width: 600px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      ">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="
            width: 64px;
            height: 64px;
            background: #fee;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            margin-bottom: 16px;
          ">⚠️</div>
          <h1 style="margin: 0; color: #1a1a1a; font-size: 24px;">Firebase Configuration Error</h1>
        </div>
        
        <div style="
          background: #fef3f2;
          border-left: 4px solid #f87171;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
        ">
          <p style="margin: 0 0 12px 0; color: #991b1b; font-weight: 600;">Missing Environment Variables:</p>
          <ul style="margin: 0; padding-left: 20px; color: #7f1d1d;">
            ${missingVars.map(v => `<li><code style="background: #fee; padding: 2px 6px; border-radius: 4px;">${v}</code></li>`).join('')}
          </ul>
        </div>
        
        <div style="color: #4b5563; line-height: 1.6; margin-bottom: 24px;">
          <p style="margin: 0 0 16px 0; font-weight: 600;">To fix this issue:</p>
          <ol style="margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Ensure your <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">.env</code> file exists in the project root</li>
            <li style="margin-bottom: 8px;">Add all required Firebase configuration values (see <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">.env.example</code>)</li>
            <li style="margin-bottom: 8px;">Restart the development server</li>
          </ol>
        </div>
        
        <div style="
          background: #f0f9ff;
          border-left: 4px solid #3b82f6;
          padding: 16px;
          border-radius: 8px;
          font-size: 14px;
          color: #1e40af;
        ">
          <strong>💡 Tip:</strong> After updating your .env file, stop the dev server (Ctrl+C) and run <code style="background: #dbeafe; padding: 2px 6px; border-radius: 4px;">npm run dev</code> again.
        </div>
      </div>
    </div>
  `;
  
  throw new Error('Firebase configuration incomplete. Check console for details.');
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw error;
}

// Initialize Firestore with offline persistence
initializeFirestore(app, {
  localCache: persistentLocalCache()
});

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;

