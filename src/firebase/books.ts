import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';

export interface Book {
  id: string;
  name: string;
  ownerUid: string;
  createdAt: any;
}

export const createBook = async (name: string, ownerUid: string): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'books'), {
      name,
      ownerUid,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating book:', error);
    throw error;
  }
};

export const getBooksByUser = async (uid: string): Promise<Book[]> => {
  try {
    const q = query(collection(db, 'books'), where('ownerUid', '==', uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    } as Book));
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

export const getBookById = async (bookId: string): Promise<Book | null> => {
  try {
    const docRef = doc(db, 'books', bookId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Book;
    }
    return null;
  } catch (error) {
    console.error('Error fetching book:', error);
    throw error;
  }
};

