import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabase';

export const useStudentJourney = (userId: string) => {
  const [stats, setStats] = useState<any>(null);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJourneyData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    
    try {
      // 1. Fetch Profile (XP, Level, Streak, Stars)
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileErr) throw profileErr;

      // 2. Fetch Unit Progress
      const { data: progressData, error: progressErr } = await supabase
        .from('student_progress')
        .select('*')
        .eq('profile_id', userId);

      if (progressErr) throw progressErr;

      setStats(profileData || { xp: 0, level: 1, streak: 0, stars: 0 });
      setProgress(progressData || []);
    } catch (err) {
      console.error('Journey data fallback activated:', err);
      setStats({ xp: 0, level: 1, streak: 0, stars: 0 });
      setProgress([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const completeLesson = useCallback(async (unitId: string, earnedXp: number) => {
    if (!userId) return false;
    
    try {
      // 1. Fetch current profile to calculate new XP
      const { data: profile } = await supabase
        .from('profiles')
        .select('xp, level')
        .eq('id', userId)
        .maybeSingle();

      const currentXp = profile?.xp || 0;
      const newXp = currentXp + earnedXp;
      const newLevel = Math.floor(newXp / 100) + 1;

      // Update XP
      const { error: profileErr } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          xp: newXp,
          level: newLevel,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (profileErr) throw profileErr;

      // 2. Mark Unit as Completed
      const { error: progressErr } = await supabase
        .from('student_progress')
        .upsert({
          profile_id: userId,
          unit_id: unitId,
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'profile_id,unit_id' });

      if (progressErr) throw progressErr;

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
      // Fetch current profile to calculate new stats
      const { data: profile } = await supabase
        .from('profiles')
        .select('xp, stars')
        .eq('id', userId)
        .maybeSingle();

      const currentXp = profile?.xp || 0;
      const currentStars = profile?.stars || 0;
      const newXp = currentXp + xpGained;
      const newStars = currentStars + starsEarned;
      const newLevel = Math.floor(newXp / 100) + 1;

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          xp: newXp,
          stars: newStars,
          level: newLevel,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) throw error;
      
      await fetchJourneyData();
      return { success: true };
    } catch (err) {
      console.error('Error adding student rewards:', err);
      return { success: false, error: err };
    }
  }, [userId, fetchJourneyData]);

  useEffect(() => {
    if (userId) fetchJourneyData();
  }, [userId, fetchJourneyData]);

  return { stats, progress, loading, completeLesson, addStudentRewards, refresh: fetchJourneyData };
};
