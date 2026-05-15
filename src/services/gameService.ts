import { db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

/**
 * Fetches the vocabulary list for a specific unit.
 */
export const getUnitVocabulary = async (unitId: string): Promise<string[]> => {
  try {
    const docRef = doc(db, 'units', unitId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      return [];
    }
    
    const data = snap.data();
    // Returns e.g., ["Fridge", "Spoon", "Oven"]
    return Array.isArray(data.vocabulary_list) ? data.vocabulary_list : []; 
  } catch (err) {
    console.error('Unexpected error in getUnitVocabulary:', err);
    return [];
  }
};

/**
 * Updates the vocabulary list for a unit (Admin only).
 */
export const updateUnitVocabulary = async (unitId: string, vocabulary: string[]) => {
  try {
    const docRef = doc(db, 'units', unitId);
    await updateDoc(docRef, { vocabulary_list: vocabulary });
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
};
