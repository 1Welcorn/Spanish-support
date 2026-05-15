import { useEffect, useState, useCallback } from 'react';
import { db } from '../services/firebase';
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs, increment } from 'firebase/firestore';

export const useStudentJourney = (userId: string) => {
  const [stats, setStats] = useState<any>(null);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJourneyData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    
    try {
      // 1. Fetch Profile (XP, Level, Streak)
      const profileRef = doc(db, 'profiles', userId);
      const profileSnap = await getDoc(profileRef);
      const profileData = profileSnap.exists() ? profileSnap.data() : null;

      // 2. Fetch Unit Progress
      const q = query(collection(db, 'student_progress'), where('profile_id', '==', userId));
      const progressSnap = await getDocs(q);
      const progressData = progressSnap.docs.map((d: any) => d.data());

      setStats(profileData || { xp: 0, level: 1, streak: 0, stars: 0 });
      setProgress(progressData || []);
    } catch (err) {
      console.error('Journey data fallback activated');
      setStats({ xp: 0, level: 1, streak: 0, stars: 0 });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const completeLesson = useCallback(async (unitId: string, earnedXp: number) => {
    if (!userId) return false;
    
    try {
      // 1. Update XP
      const profileRef = doc(db, 'profiles', userId);
      await updateDoc(profileRef, {
        xp: increment(earnedXp)
      }).catch(async (e: any) => {
        // Create if doesn't exist
        await setDoc(profileRef, { xp: earnedXp, level: 1, streak: 0, stars: 0 });
      });

      // 2. Mark Unit as Completed
      const docId = `${userId}_${unitId}`;
      await setDoc(doc(db, 'student_progress', docId), {
        profile_id: userId,
        unit_id: unitId,
        status: 'completed',
        completed_at: new Date().toISOString()
      }, { merge: true });

      // Refresh data locally
      await fetchJourneyData();
      return true;
    } catch (err) {
      console.error('Error in completeLesson:', err);
      return false;
    }
  }, [userId, fetchJourneyData]);

  const addStudentRewards = useCallback(async (xpGained: number, starsEarned: number) => {
    if (!userId) return { success: false };
    
    try {
      const profileRef = doc(db, 'profiles', userId);
      await updateDoc(profileRef, {
        xp: increment(xpGained),
        stars: increment(starsEarned)
      }).catch(async () => {
        await setDoc(profileRef, { xp: xpGained, stars: starsEarned, level: 1, streak: 0 });
      });
      
      await fetchJourneyData();
      return { success: true };
    } catch (err) {
      console.error('Error adding student rewards:', err);
      return { success: false, error: err };
    }
  }, [userId, fetchJourneyData]);

  useEffect(() => {
    if (userId) fetchJourneyData();
  }, [userId]);

  return { stats, progress, loading, completeLesson, addStudentRewards, refresh: fetchJourneyData };
};
