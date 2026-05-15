import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
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
      const [uRes, sRes, aRes, setsRes] = await Promise.all([
        supabase.from('units').select('*').order('sort_order'),
        supabase.from('sessions').select('*').eq('profile_id', profileId).order('session_date', { ascending: false }),
        supabase.from('answers').select('*').eq('profile_id', profileId),
        supabase.from('settings').select('*')
      ]);

      if (uRes.data) {
        const sanitizedUnits = uRes.data.map(u => ({
          ...u,
          descriptors: typeof u.descriptors === 'string' ? JSON.parse(u.descriptors) : (u.descriptors || []),
          embed_urls: typeof u.embed_urls === 'string' ? JSON.parse(u.embed_urls) : (u.embed_urls || []),
          questions: typeof u.questions === 'string' ? JSON.parse(u.questions) : (u.questions || []),
          external_links: typeof u.external_links === 'string' ? JSON.parse(u.external_links) : (u.external_links || []),
          vocabulary_list: typeof u.vocabulary_list === 'string' ? JSON.parse(u.vocabulary_list) : (u.vocabulary_list || []),
          is_locked: !!u.is_locked
        }));
        setUnits(sanitizedUnits);
      }
      if (sRes.data) setSessions(sRes.data);
      if (aRes.data) {
        const aMap: Record<string, Answer> = {};
        aRes.data.forEach(a => aMap[`${a.unit_id}-${a.question_index}`] = a);
        setAnswers(aMap);
      }
      if (setsRes.data) {
        const sMap: Partial<AppSettings> = {};
        setsRes.data.forEach(s => sMap[s.key as keyof AppSettings] = s.value);
        setSettings(sMap);
      }
      setSyncStatus('ok');
    } catch (err) {
      console.error('Error fetching data:', err);
      setSyncStatus('err');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    // Inscrição em tempo real com nome único para evitar conflitos entre instâncias do hook
    const channelId = `dari-realtime-${Math.random().toString(36).substring(7)}`;
    const channel = supabase.channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'units' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'answers' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, fetchData)
      .subscribe((status) => {
        setSyncStatus(status === 'SUBSCRIBED' ? 'ok' : 'err');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const saveAnswer = useCallback(async (unitId: string, qIdx: number, val: string) => {
    try {
      const { error } = await supabase.from('answers').upsert({
        profile_id: user?.id,
        unit_id: unitId,
        question_index: qIdx,
        answer_value: val,
        is_done: true
      }, { onConflict: 'profile_id,unit_id,question_index' });
      
      if (error) {
        console.error('Error saving answer to Supabase:', error);
        setSyncStatus('err');
        return false;
      }
      
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
      const { data, error } = await supabase.from('sessions').insert({
        profile_id: user?.id,
        unit_id: unitId,
        session_date: new Date().toLocaleDateString('pt-BR'),
        note
      }).select().single();
      
      if (error) {
        console.error('Error saving session:', error);
        return false;
      }
      
      if (data) {
        setSessions(prev => [data, ...prev]);
      }
      return true;
    } catch (err) {
      console.error('Exception in saveSession:', err);
      return false;
    }
  }, []);

  const resetUnitAnswers = useCallback(async (unitId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('answers').delete().eq('unit_id', unitId).eq('profile_id', user?.id);
      if (error) {
        console.error('Error resetting unit answers:', error);
        setSyncStatus('err');
        return false;
      } else {
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
      }
    } catch (err) {
      console.error('Exception in resetUnitAnswers:', err);
      setSyncStatus('err');
      return false;
    }
  }, []);

  const updateSession = useCallback(async (sessionId: string, note: string) => {
    try {
      const { error } = await supabase.from('sessions').update({ note }).eq('id', sessionId);
      if (error) {
        console.error('Error updating session:', error);
        setSyncStatus('err');
        return false;
      }
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
      const { error } = await supabase.from('sessions').delete().eq('id', sessionId);
      if (error) {
        console.error('Error deleting session:', error);
        setSyncStatus('err');
        return false;
      }
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

      const { error } = await supabase.from('units').insert(newUnit);
      if (error) {
        console.error('Error creating unit:', error);
        return false;
      }
      
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
      
      // Tentativa 1: Update normal
      let { error } = await supabase.from('units').update(updates).eq('id', id);
      
      // Se der erro de coluna is_locked inexistente
      if (error && error.message?.includes('is_locked')) {
        console.warn('useData: Column is_locked not found, retrying without it');
        const { is_locked, ...safeUpdates } = updates;
        const retry = await supabase.from('units').update(safeUpdates).eq('id', id);
        error = retry.error;
      }

      if (error) {
        console.error('[SAVE ERROR] useData:', error);
        return { success: false, error: error.message };
      }
      
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
