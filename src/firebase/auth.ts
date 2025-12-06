import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  User 
} from 'firebase/auth';
import { auth } from './config';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';
import { getFirebaseErrorInfo, logFirebaseError } from '../lib/firebase-error-handler';

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Create or update user profile
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        displayName: user.displayName || '',
        email: user.email || '',
        createdAt: serverTimestamp(),
      });
    }
    
    return user;
  } catch (error) {
    logFirebaseError(error, 'Google Sign-in');
    const errorInfo = getFirebaseErrorInfo(error);
    
    // You can show this error in your UI toast/notification system
    console.error(`${errorInfo.title}: ${errorInfo.message}`);
    if (errorInfo.action) {
      console.info(`Suggested action: ${errorInfo.action}`);
    }
    
    throw error;
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    logFirebaseError(error, 'Sign-out');
    throw error;
  }
};

