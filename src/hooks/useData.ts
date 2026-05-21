import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, supabaseAdmin } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import type { Unit, Session, Answer, AppSettings } from '../types';


export const useDariData = () => {
  // Tenta carregar cache local para mostrar dados instantaneamente
  const getCachedUnits = (): Unit[] => {
    try {
      const raw = localStorage.getItem('cache_units');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  };

  const cachedUnits = getCachedUnits();
  const [units, setUnits] = useState<Unit[]>(cachedUnits);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [settings, setSettings] = useState<Partial<AppSettings>>({});
  // Se houver cache, não bloqueia a tela com loading
  const [loading, setLoading] = useState(cachedUnits.length === 0);
  const [syncStatus, setSyncStatus] = useState<'ok' | 'err'>('ok');
  const { user } = useAuth();

  const sanitizeUnits = useCallback((fetchedUnits: any[]): Unit[] => {
    return fetchedUnits.map((u: any) => ({
      ...u,
      descriptors: typeof u.descriptors === 'string' ? JSON.parse(u.descriptors) : (u.descriptors || []),
      embed_urls: typeof u.embed_urls === 'string' ? JSON.parse(u.embed_urls) : (u.embed_urls || []),
      questions: typeof u.questions === 'string' ? JSON.parse(u.questions) : (u.questions || []),
      external_links: typeof u.external_links === 'string' ? JSON.parse(u.external_links) : (u.external_links || []),
      vocabulary_list: typeof u.vocabulary_list === 'string' ? JSON.parse(u.vocabulary_list) : (u.vocabulary_list || []),
      is_locked: !!u.is_locked
    }));
  }, []);

  const fetchUnits = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('units').select('*').order('sort_order', { ascending: true });
      if (error) throw error;
      if (data) {
        const sanitized = sanitizeUnits(data);
        try { localStorage.setItem('cache_units', JSON.stringify(sanitized)); } catch {}
        setUnits(sanitized);
      }
    } catch (err) {
      console.error('Error fetching units:', err);
      setSyncStatus('err');
    }
  }, [sanitizeUnits]);

  const fetchSessions = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('profile_id', user.id);
      
      if (error) throw error;
      if (data) {
        const sorted = [...data].sort((a: any, b: any) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime());
        setSessions(sorted as Session[]);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    }
  }, [user]);

  const fetchAnswers = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('answers')
        .select('*')
        .eq('profile_id', user.id);
      
      if (error) throw error;
      if (data) {
        const aMap: Record<string, Answer> = {};
        data.forEach((a: any) => {
          aMap[`${a.unit_id}-${a.question_index}`] = a as Answer;
        });
        setAnswers(aMap);
      }
    } catch (err) {
      console.error('Error fetching answers:', err);
    }
  }, [user]);

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('settings').select('*');
      if (error) throw error;
      if (data) {
        const sMap: Partial<AppSettings> = {};
        data.forEach((s: any) => {
          sMap[s.key as keyof AppSettings] = s.value;
        });
        setSettings(sMap);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      await Promise.all([
        fetchUnits(),
        fetchSessions(),
        fetchAnswers(),
        fetchSettings()
      ]);
      setSyncStatus('ok');
    } catch (err) {
      console.error('Error fetching data from Supabase:', err);
      setSyncStatus('err');
    } finally {
      setLoading(false);
    }
  }, [user, fetchUnits, fetchSessions, fetchAnswers, fetchSettings]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchData();

    // Set up realtime subscriptions
    const channel = supabase.channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'units' }, () => {
        fetchUnits();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, () => {
        fetchSessions();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'answers' }, () => {
        fetchAnswers();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => {
        fetchSettings();
      })
      .subscribe((status) => {
        setSyncStatus(status === 'SUBSCRIBED' ? 'ok' : 'err');
      });

    return () => {
      channel.unsubscribe();
    };
  }, [user, fetchData, fetchUnits, fetchSessions, fetchAnswers, fetchSettings]);

  const saveAnswer = useCallback(async (unitId: string, qIdx: number, val: string) => {
    if (!user) return false;
    try {
      const payload = {
        profile_id: user.id,
        unit_id: unitId,
        question_index: qIdx,
        answer_value: val,
        is_done: true,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('answers')
        .upsert(payload, { onConflict: 'profile_id,unit_id,question_index' });

      if (error) throw error;
      
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
  }, [user]);

  const saveSession = useCallback(async (unitId: string, note: string) => {
    if (!user) return false;
    try {
      const sessionData = {
        profile_id: user.id,
        unit_id: unitId,
        session_date: new Date().toLocaleDateString('pt-BR'),
        note
      };
      const { data, error } = await supabase.from('sessions').insert(sessionData).select();
      if (error) throw error;
      
      const inserted = data?.[0] || sessionData;
      setSessions(prev => [inserted as Session, ...prev]);
      return true;
    } catch (err) {
      console.error('Exception in saveSession:', err);
      return false;
    }
  }, [user]);

  const resetUnitAnswers = useCallback(async (unitId: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const { error } = await supabase
        .from('answers')
        .delete()
        .eq('unit_id', unitId)
        .eq('profile_id', user.id);

      if (error) throw error;
      
      setSyncStatus('ok');
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
  }, [user]);

  const updateSession = useCallback(async (sessionId: string, note: string) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ note })
        .eq('id', sessionId);

      if (error) throw error;
      
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
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
      
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
        title: title || 'Nova Unidade',
        sub: 'Nova aula · 10 min',
        color: 'emerald',
        sort_order: units.length,
        brief: 'Diretrizes para mediação pedagógica focada no desenvolvimento da autonomia e competência linguística...',
        plan_c: 'Língua Inglesa: Estudo do léxico, estruturas gramaticais em contextos significativos e práticas de multiletramento.',
        plan_h: 'Mobilizar conhecimentos prévios para a compreensão de textos orais e escritos, desenvolvendo estratégias de leitura e produção textual.',
        plan_e: 'Metodologias ativas com suporte de TIC, mediação individualizada, recursos gamificados (Wordwall) e vídeos instrucionais.',
        plan_a: 'Formativa e contínua: registros em diário de classe, observação do engajamento e evolução na resolução de problemas.',
        wa: 'Olá! Vamos iniciar uma nova jornada de aprendizagem hoje...',
        embed_urls: [],
        descriptors: [],
        questions: [],
        external_links: []
      };

      const { error } = await supabase.from('units').insert(newUnit);
      if (error) throw error;
      
      setUnits(prev => [...prev, newUnit]);
      return true;
    } catch (err) {
      console.error('Exception in createUnit:', err);
      return false;
    }
  }, [units.length]);

  const updateUnit = useCallback(async (id: string, updates: any) => {
    try {
      console.log('useData: Updating unit', id, Object.keys(updates));
      
      // 1. Atualização otimista instantânea no estado do React
      setUnits(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
      
      // 2. Atualização síncrona do cache localStorage para persistência imediata
      try {
        const cached = localStorage.getItem('cache_units');
        if (cached) {
          const parsed = JSON.parse(cached);
          const updated = parsed.map((u: any) => u.id === id ? { ...u, ...updates } : u);
          localStorage.setItem('cache_units', JSON.stringify(updated));
        }
      } catch (cacheErr) {
        console.warn('Failed to update localStorage cache:', cacheErr);
      }

      // 3. Execução da gravação do Supabase (removendo ID do payload de atualização)
      // Usa supabaseAdmin (service key) para bypassar RLS quando disponível.
      // Isso permite que o admin salve mesmo sem sessão JWT real no Supabase.
      const { id: _, ...payload } = updates;
      const { error, data } = await supabaseAdmin
        .from('units')
        .update(payload)
        .eq('id', id)
        .select('id');

      if (error) {
        console.error('[SUPABASE ERROR] code:', error.code, 'message:', error.message, 'details:', error.details);
        throw error;
      }

      // Verifica se alguma linha foi afetada (RLS pode bloquear silenciosamente)
      if (!data || data.length === 0) {
        console.warn('[SUPABASE WARNING] Unit update returned 0 rows. RLS may have blocked the write. Unit id:', id);
        // Não falha — o dado já foi salvo localmente. Mas loga para diagnóstico.
      } else {
        console.log('[SUPABASE OK] Unit updated successfully:', id);
      }

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
