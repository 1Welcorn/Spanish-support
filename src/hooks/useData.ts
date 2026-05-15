import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy, where, doc, setDoc, addDoc, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import type { Unit, Session, Answer, AppSettings } from '../types';

export const useDariData = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [settings, setSettings] = useState<Partial<AppSettings>>({});
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'ok' | 'err'>('ok');
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const profileId = user.id;

      // Unidades
      const qUnits = query(collection(db, 'units'), orderBy('sort_order'));
      const uSnapshot = await getDocs(qUnits);
      const fetchedUnits = uSnapshot.docs.map((d: any) => ({ id: d.id, ...d.data() } as any));

      const sanitizedUnits = fetchedUnits.map((u: any) => ({
        ...u,
        descriptors: typeof u.descriptors === 'string' ? JSON.parse(u.descriptors) : (u.descriptors || []),
        embed_urls: typeof u.embed_urls === 'string' ? JSON.parse(u.embed_urls) : (u.embed_urls || []),
        questions: typeof u.questions === 'string' ? JSON.parse(u.questions) : (u.questions || []),
        external_links: typeof u.external_links === 'string' ? JSON.parse(u.external_links) : (u.external_links || []),
        vocabulary_list: typeof u.vocabulary_list === 'string' ? JSON.parse(u.vocabulary_list) : (u.vocabulary_list || []),
        is_locked: !!u.is_locked
      }));
      setUnits(sanitizedUnits);

      // Sessions
      const qSessions = query(collection(db, 'sessions'), where('profile_id', '==', profileId));
      const sSnapshot = await getDocs(qSessions);
      const fetchedSessions = sSnapshot.docs.map((d: any) => ({ id: d.id, ...d.data() } as Session));
      // Sort in memory since Firestore requires composite index for where + orderBy
      fetchedSessions.sort((a: any, b: any) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime());
      setSessions(fetchedSessions);

      // Answers
      const qAnswers = query(collection(db, 'answers'), where('profile_id', '==', profileId));
      const aSnapshot = await getDocs(qAnswers);
      const aMap: Record<string, Answer> = {};
      aSnapshot.docs.forEach((d: any) => {
        const a = d.data() as Answer;
        aMap[`${a.unit_id}-${a.question_index}`] = a;
      });
      setAnswers(aMap);

      // Settings
      const setsSnapshot = await getDocs(collection(db, 'settings'));
      const sMap: Partial<AppSettings> = {};
      setsSnapshot.docs.forEach((d: any) => {
        const s = d.data();
        sMap[s.key as keyof AppSettings] = s.value;
      });
      setSettings(sMap);

      setSyncStatus('ok');
    } catch (err) {
      console.error('Error fetching data from Firestore:', err);
      setSyncStatus('err');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!user) return;
    
    // Set up realtime listeners for Firestore
    const unsubUnits = onSnapshot(collection(db, 'units'), fetchData, () => setSyncStatus('err'));
    const unsubSessions = onSnapshot(query(collection(db, 'sessions'), where('profile_id', '==', user.id)), fetchData, () => setSyncStatus('err'));
    const unsubAnswers = onSnapshot(query(collection(db, 'answers'), where('profile_id', '==', user.id)), fetchData, () => setSyncStatus('err'));
    const unsubSettings = onSnapshot(collection(db, 'settings'), fetchData, () => setSyncStatus('err'));

    return () => {
      unsubUnits();
      unsubSessions();
      unsubAnswers();
      unsubSettings();
    };
  }, [fetchData, user]);

  const saveAnswer = useCallback(async (unitId: string, qIdx: number, val: string) => {
    try {
      const docId = `${user?.uid || user?.id}_${unitId}_${qIdx}`;
      await setDoc(doc(db, 'answers', docId), {
        profile_id: user?.uid || user?.id,
        unit_id: unitId,
        question_index: qIdx,
        answer_value: val,
        is_done: true
      });
      
      // Atualiza estado local apenas após sucesso
      const answerKey = `${unitId}-${qIdx}`;
      setAnswers(prev => ({
        ...prev,
        [answerKey]: {
          unit_id: unitId,
          question_index: qIdx,
          answer_value: val,
          is_done: true
        }
      }));
      
      setSyncStatus('ok');
      return true;
    } catch (err) {
      console.error('Exception in saveAnswer:', err);
      setSyncStatus('err');
      return false;
    }
  }, []);

  const saveSession = useCallback(async (unitId: string, note: string) => {
    try {
      const sessionData = {
        profile_id: user?.uid || user?.id,
        unit_id: unitId,
        session_date: new Date().toLocaleDateString('pt-BR'),
        note
      };
      const docRef = await addDoc(collection(db, 'sessions'), sessionData);
      
      setSessions(prev => [{ id: docRef.id, ...sessionData } as Session, ...prev]);
      return true;
    } catch (err) {
      console.error('Exception in saveSession:', err);
      return false;
    }
  }, []);

  const resetUnitAnswers = useCallback(async (unitId: string): Promise<boolean> => {
    try {
      const q = query(collection(db, 'answers'), where('unit_id', '==', unitId), where('profile_id', '==', user?.uid || user?.id));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map((d: any) => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      
      setSyncStatus('ok');
        // Actualiza estado local eliminando las claves de esta unidad
        setAnswers(prev => {
          const next = { ...prev };
          Object.keys(next).forEach(key => {
            if (key.startsWith(`${unitId}-`)) {
              delete next[key];
            }
          });
          return next;
        });
        return true;
    } catch (err) {
      console.error('Exception in resetUnitAnswers:', err);
      setSyncStatus('err');
      return false;
    }
  }, []);

  const updateSession = useCallback(async (sessionId: string, note: string) => {
    try {
      await updateDoc(doc(db, 'sessions', sessionId), { note });
      setSyncStatus('ok');
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, note } : s));
      return true;
    } catch (err) {
      console.error('Exception in updateSession:', err);
      setSyncStatus('err');
      return false;
    }
  }, []);

  const deleteUnitSession = useCallback(async (sessionId: string) => {
    try {
      await deleteDoc(doc(db, 'sessions', sessionId));
      setSyncStatus('ok');
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      return true;
    } catch (err) {
      console.error('Exception in deleteSession:', err);
      setSyncStatus('err');
      return false;
    }
  }, []);

  const createUnit = useCallback(async (title: string) => {
    try {
      const newId = `u${Date.now()}`;
      const newUnit: Unit = {
        id: newId,
        title: title || 'Nueva Unidad',
        sub: 'Nueva clase · 10 min',
        color: 'emerald',
        sort_order: units.length,
        brief: 'Directrices para mediación pedagógica enfocada en el desarrollo de la autonomía y competencia lingüística...',
        plan_c: 'Lengua Inglesa: Estudio del léxico, estructuras gramaticales en contextos significativos y prácticas de multialfabetización.',
        plan_h: 'Movilizar conocimientos previos para la comprensión de textos orales y escritos, desarrollando estrategias de lectura y producción textual adaptadas al contexto domiciliario.',
        plan_e: 'Metodologías activas con soporte de TIC (Tecnologías de Información y Comunicación), mediación individualizada, recursos gamificados (Wordwall) y videos instruccionales.',
        plan_a: 'Formativa y continua: registros en diario de clase, observación del compromiso en las plataformas interactivas y evolución en la resolución de problemas lingüísticos.',
        wa: '¡Hola! Vamos a iniciar una nueva jornada de aprendizaje hoy...',
        embed_urls: [],
        descriptors: [],
        questions: [],
        external_links: []
      };

      await setDoc(doc(db, 'units', newId), newUnit);
      setUnits(prev => [...prev, newUnit]);
      return true;
    } catch (err) {
      console.error('Exception in createUnit:', err);
      return false;
    }
  }, [units.length]);

  const updateUnit = useCallback(async (id: string, updates: any) => {
    try {
      console.log('useData: Updating unit', id, updates);
      await updateDoc(doc(db, 'units', id), updates);
      // Atualização otimista
      setUnits(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
      return { success: true };
    } catch (err: any) {
      console.error('[SAVE EXCEPTION] useData:', err);
      return { success: false, error: err.message || 'Erro desconhecido' };
    }
  }, []);

  return {
    units,
    sessions,
    answers,
    settings,
    loading,
    syncStatus,
    saveAnswer,
    saveSession,
    updateSession,
    deleteSession: deleteUnitSession,
    resetUnitAnswers,
    updateUnit,
    createUnit,
    refresh: fetchData
  };
};
