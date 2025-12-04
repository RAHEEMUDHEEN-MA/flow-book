import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';
import { createOrUpdateTag } from './tags';

export interface Entry {
  id: string;
  bookId: string;
  ownerUid: string;
  type: 'income' | 'expense';
  amount: number;
  date: Timestamp;
  description: string;
  tags: string[];
  attachmentUrl?: string;
  createdAt: any;
  updatedAt: any;
}

export interface EntryInput {
  bookId: string;
  ownerUid: string;
  type: 'income' | 'expense';
  amount: number;
  date: Date;
  description: string;
  tags: string[];
  attachmentUrl?: string;
}

export const createEntry = async (entryData: EntryInput): Promise<string> => {
  try {
    // Sync tags first
    for (const tag of entryData.tags) {
      await createOrUpdateTag(entryData.ownerUid, tag);
    }
    
    const docRef = await addDoc(collection(db, 'entries'), {
      ...entryData,
      date: Timestamp.fromDate(entryData.date),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating entry:', error);
    throw error;
  }
};

export const updateEntry = async (
  entryId: string, 
  entryData: Partial<EntryInput>,
  ownerUid: string
): Promise<void> => {
  try {
    // Sync tags if they're being updated
    if (entryData.tags) {
      for (const tag of entryData.tags) {
        await createOrUpdateTag(ownerUid, tag);
      }
    }
    
    const entryRef = doc(db, 'entries', entryId);
    const updateData: any = {
      ...entryData,
      updatedAt: serverTimestamp(),
    };
    
    if (entryData.date) {
      updateData.date = Timestamp.fromDate(entryData.date);
    }
    
    await updateDoc(entryRef, updateData);
  } catch (error) {
    console.error('Error updating entry:', error);
    throw error;
  }
};

export const deleteEntry = async (entryId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'entries', entryId));
  } catch (error) {
    console.error('Error deleting entry:', error);
    throw error;
  }
};

export const getEntriesByBook = async (bookId: string): Promise<Entry[]> => {
  try {
    const q = query(
      collection(db, 'entries'),
      where('bookId', '==', bookId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Entry));
  } catch (error) {
    console.error('Error fetching entries:', error);
    throw error;
  }
};

