import { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export const useDashboardData = (userId: string) => {
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      if (!userId) return;
      setLoading(true);
      
      // 1. Fetch all units first
      const uSnapshot = await getDocs(collection(db, 'units'));
      const allUnits = uSnapshot.docs.map((d: any) => ({ id: d.id, ...d.data() }));

      // 2. Fetch progress for this specific user
      const qProg = query(collection(db, 'student_progress'), where('profile_id', '==', userId));
      const pSnapshot = await getDocs(qProg);
      const progressData = pSnapshot.docs.map((d: any) => d.data());

      // 3. Merge and sort
      const merged = (allUnits || []).map((u: any) => {
        const prog = (progressData || []).find((p: any) => p.unit_id === u.id);
        return {
          unit_id: u.id,
          unit_title: u.title,
          unit_sub: u.sub,
          unit_color: u.color,
          unit_status: prog ? prog.status : 'not_started'
        };
      }).sort((a: any, b: any) => {
        const numA = parseInt(a.unit_title.match(/\d+/)?.[0] || '999');
        const numB = parseInt(b.unit_title.match(/\d+/)?.[0] || '999');
        return numA - numB;
      });

      setUnits(merged);
      setLoading(false);
    };

    getData();
  }, [userId]);

  return { units, loading };
};
