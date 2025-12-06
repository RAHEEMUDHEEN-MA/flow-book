# Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Firebase**
   
   Update `src/firebase/config.ts` with your Firebase configuration:
   ```typescript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id"
   };
   ```

3. **Firebase Console Setup**
   
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select existing
   - Enable **Authentication** → **Sign-in method** → **Google**
   - Create **Firestore Database** (start in test mode, then update rules)
   - Enable **Storage** (optional, for attachments)
   - Copy your config from Project Settings → General → Your apps

4. **Deploy Firestore Rules & Indexes**
   
   - Go to Firestore Database → Rules
   - Copy contents from `firestore.rules`
   - Paste and publish
   
   - Go to Firestore Database → Indexes
   - Click "Add Index" or use the auto-generated link from error messages
   - Required indexes are defined in `firestore.indexes.json`

5. **PWA Icons** (Optional but recommended)
   
   Replace placeholder icons in `public/`:
   - `pwa-192x192.png` (192x192px)
   - `pwa-512x512.png` (512x512px)
   
   You can generate icons at: https://www.pwabuilder.com/imageGenerator

6. **Run Development Server**
   ```bash
   npm run dev
   ```

7. **Build for Production**
   ```bash
   npm run build
   ```

## Testing PWA Features

1. **Install Prompt**: The install prompt will appear automatically when the app meets PWA criteria
2. **Offline Mode**: 
   - Open DevTools → Network → Check "Offline"
   - The app should still work with cached data
3. **Service Worker**: Check DevTools → Application → Service Workers

## Troubleshooting

### Firebase Auth Not Working
- Ensure Google sign-in is enabled in Firebase Console
- Check that your domain is authorized in Authentication settings

### Firestore Permission Denied
- Verify security rules are deployed correctly
- Check that user is authenticated (`request.auth != null`)

### PWA Not Installing
- Ensure you're using HTTPS (or localhost)
- Check that manifest.json is accessible
- Verify service worker is registered (DevTools → Application)

### Offline Not Working
- Check Firestore persistence is enabled in `src/firebase/config.ts`
- Verify service worker is active
- Clear cache and reload

