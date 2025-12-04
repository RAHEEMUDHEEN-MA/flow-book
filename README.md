# Flow Book - Personal Finance PWA

A modern, offline-first Progressive Web App for tracking personal finances, built with React, TypeScript, Vite, and Firebase.

## Features

- 🔐 **Google Authentication** - Secure login with Firebase Auth
- 📚 **Multiple Books** - Organize finances into separate books
- 💰 **Income & Expense Tracking** - Track all your financial transactions
- 🏷️ **Smart Tags** - Auto-suggested tags based on usage history
- 🔍 **Advanced Filtering** - Filter by type, tags, date range, and amount
- 📱 **PWA Support** - Works offline, installable on mobile devices
- 🎨 **Modern UI** - Clean, mobile-first design inspired by CashBook

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** - Fast build tool
- **TailwindCSS** - Utility-first CSS
- **React Router** - Client-side routing
- **Firebase**:
  - Authentication (Google)
  - Firestore (with offline persistence)
  - Storage (for attachments)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Firebase project with:
  - Authentication enabled (Google provider)
  - Firestore database
  - Storage bucket (optional, for attachments)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd flow_book
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Google Authentication
   - Create a Firestore database
   - Copy your Firebase config
   - Update `src/firebase/config.ts` with your Firebase configuration:

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

4. Deploy Firestore Security Rules:
   - Copy the rules from `firestore.rules`
   - Deploy to Firebase Console → Firestore Database → Rules

5. Run the development server:
```bash
npm run dev
```

6. Build for production:
```bash
npm run build
```

## Project Structure

```
flow_book/
├── public/
│   ├── manifest.json          # PWA manifest
│   └── service-worker.js      # Service worker for offline support
├── src/
│   ├── components/
│   │   ├── BookCard.tsx       # Book card component
│   │   ├── EntryCard.tsx      # Entry card component
│   │   ├── FilterBar.tsx      # Filtering component
│   │   ├── InstallPrompt.tsx  # PWA install prompt
│   │   └── TagInput.tsx       # Tag input with suggestions
│   ├── firebase/
│   │   ├── auth.ts            # Authentication helpers
│   │   ├── books.ts           # Book CRUD operations
│   │   ├── config.ts          # Firebase configuration
│   │   ├── entries.ts         # Entry CRUD operations
│   │   ├── storage.ts         # File upload helpers
│   │   └── tags.ts            # Tag management
│   ├── pages/
│   │   ├── AddEntryPage.tsx   # Add/edit entry page
│   │   ├── BookDetailPage.tsx # Book detail with entries
│   │   ├── BooksPage.tsx      # Books listing page
│   │   ├── LoginPage.tsx      # Login page
│   │   └── UserProfile.tsx    # User profile page
│   ├── App.tsx                # Main app component with routing
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
├── firestore.rules            # Firestore security rules
└── package.json
```

## Firebase Data Structure

### Users
```
users/{uid}
  - displayName: string
  - email: string
  - createdAt: timestamp

users/{uid}/tags/{tagName}
  - name: string
  - lastUsedAt: timestamp
```

### Books
```
books/{bookId}
  - name: string
  - ownerUid: string
  - createdAt: timestamp
```

### Entries
```
entries/{entryId}
  - bookId: string
  - ownerUid: string
  - type: "income" | "expense"
  - amount: number
  - date: timestamp
  - description: string
  - tags: string[]
  - attachmentUrl?: string
  - createdAt: timestamp
  - updatedAt: timestamp
```

## Features in Detail

### Tag System
- Tags are automatically created/updated when entries are saved
- Tags are stored in lowercase for consistency
- Tag suggestions appear based on last used date
- Tags can be filtered in the book detail view

### Offline Support
- Firestore persistence enabled for offline access
- Service worker caches static assets
- Data syncs automatically when connection is restored

### PWA Features
- Installable on mobile and desktop
- Works offline
- Fast loading with service worker caching
- Install prompt appears when available

## Security

All Firestore security rules ensure:
- Users can only access their own data
- Books and entries are protected by ownerUid
- User tags are scoped to the authenticated user

## PWA Icons

The project includes placeholder PWA icons. For production, replace:
- `public/pwa-192x192.png` (192x192px)
- `public/pwa-512x512.png` (512x512px)

Generate icons at [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator) or create your own.

## Troubleshooting

See [SETUP.md](./SETUP.md) for detailed setup instructions and troubleshooting.

## License

MIT

