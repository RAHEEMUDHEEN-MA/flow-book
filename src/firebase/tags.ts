import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';

export interface UserTag {
  name: string;
  lastUsedAt: any;
}

export const getUserTags = async (uid: string): Promise<UserTag[]> => {
  try {
    const tagsRef = collection(db, 'users', uid, 'tags');
    const querySnapshot = await getDocs(tagsRef);
    return querySnapshot.docs.map(doc => ({
      name: doc.id,
      ...doc.data()
    } as UserTag));
  } catch (error) {
    console.error('Error fetching user tags:', error);
    throw error;
  }
};

export const createOrUpdateTag = async (uid: string, tagName: string): Promise<void> => {
  try {
    const normalizedTag = tagName.toLowerCase().trim();
    if (!normalizedTag) return;
    
    const tagRef = doc(db, 'users', uid, 'tags', normalizedTag);
    await setDoc(tagRef, {
      name: normalizedTag,
      lastUsedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error creating/updating tag:', error);
    throw error;
  }
};

