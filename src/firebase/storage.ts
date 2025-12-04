import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

export const uploadAttachment = async (
  file: File, 
  userId: string, 
  entryId: string
): Promise<string> => {
  try {
    const storageRef = ref(storage, `attachments/${userId}/${entryId}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading attachment:', error);
    throw error;
  }
};

