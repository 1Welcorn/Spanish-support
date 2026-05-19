import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
// Build trigger: TS_ERRORS_FIXED_V2
import type { Unit } from './types';
import { useAuth } from './context/AuthContext';
import { BookOpen, BarChart2, ClipboardList, MessageCircle, Lock, Unlock } from 'lucide-react';
import { LoginScreen } from './components/features/LoginScreen';
import { Dashboard } from './components/features/Dashboard';
import tulipIcon from './assets/tulip icon replacement.png';
import spanishEmblem from './assets/spanish icon replacement.png';
import sarehEmblem from './assets/sareh icon replacement.png';
import { Activities } from './components/features/Activities';
import { Progress } from './components/features/Progress';
import { Planning } from './components/features/Planning';
import PlanningEditor from './components/features/PlanningEditor';
import { WhatsAppAssistant } from './components/features/WhatsAppAssistant';
import { ModeSelectionScreen } from './components/features/ModeSelectionScreen';
import { translations } from './constants/translations';
import { useDariData } from './hooks/useData';
import { useStudentJourney } from './hooks/useStudentJourney';
import { speechService } from './utils/speech';
import { DEFAULT_UNITS } from './constants/index';
import { db } from './services/firebase';
import { setDoc, doc } from 'firebase/firestore';

export const App: React.FC = () => {
  useEffect(() => {
    speechService.preload();
  }, []);

  const { role: rawRole, user, logout, projectMode, loading: authLoading } = useAuth();
  const role = rawRole as any;
  const t = useMemo(() => {
    const mode = projectMode || 'spanish';
    const found = translations[mode];
    if (!found) {
      console.warn(`Translations not found for mode: ${mode}, falling back to spanish`);
      return translations['spanish'];
    }
    return found;
  }, [projectMode]);
  const [activeTab, setActiveTab] = useState<'adventure' | 'activities' | 'planning' | 'chat' | 'settings' | 'whatsapp'>('adventure');
  const [activeUnit, setActiveUnit] = useState<Unit | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [celebration, setCelebration] = useState<{ xp: number, stars: number } | null>(null);
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);

  const {
    units, sessions, answers, settings, loading, syncStatus,
    saveAnswer, saveSession, updateSession, deleteSession, resetUnitAnswers, updateUnit, createUnit, refresh
  } = useDariData();

  const hasSynced = useRef(false);
  
  const handleGoHome = useCallback(() => setActiveUnit(null), []);
  const handleToggle = useCallback(() => setActiveUnit(null), []);
  const handleGoAdventure = useCallback(() => setActiveTab('adventure'), []);

  const importDefaults = async () => {
    try {
      console.log("App: Iniciando sincronização total de 12 unidades...");
      let count = 0;
      for (const unit of DEFAULT_UNITS) {
        // Forçamos o envio completo de cada unidade
        await setDoc(doc(db, 'units', unit.id), {
          ...unit,
          updatedAt: new Date().toISOString()
        }); // Removido o merge para garantir que os dados subam limpos
        count++;
        console.log(`App: Sincronizada ${count}/12: ${unit.title}`);
      }
      console.log("App: Sincronização concluída com sucesso!");
      if (refresh) await refresh();
      alert('Todas as 12 aulas foram sincronizadas com sucesso!');
    } catch (err) {
      console.error("Error importing default units:", err);
      alert('Erro ao sincronizar aulas. Verifique sua conexão.');
    }
  };

  // Sincronização Inteligente de Unidades
  useEffect(() => {
    const syncUnits = async () => {
      // Sincroniza se for admin e não tiver as 12 aulas completas
      if (role === 'admin' && units && units.length < 12) {
        console.log(`App: Detectadas apenas ${units.length} aulas. Sincronizando currículo completo...`);
        try {
          for (const defaultUnit of DEFAULT_UNITS) {
            const existing = units.find(u => u.id === defaultUnit.id);
            if (!existing || existing.title !== defaultUnit.title) {
              await setDoc(doc(db, 'units', defaultUnit.id), {
                ...defaultUnit,
                updatedAt: new Date().toISOString()
              });
            }
          }
          if (refresh) refresh();
        } catch (err) {
          console.error("App: Erro na sincronização automática:", err);
        }
      }
    };
    syncUnits();
  }, [units, role, refresh]);

  // Student Journey Hook for rewards
  const { addStudentRewards } = useStudentJourney(user?.id || '');

  const handleGameOver = useCallback(async (finalScore: number, wordsFound: number) => {
    const xpGained = wordsFound * 5;
    const starsEarned = Math.floor(finalScore / 100);

    const { success } = await addStudentRewards(xpGained, starsEarned);

    if (success) {
      setCelebration({ xp: xpGained, stars: starsEarned });
    }
  }, [addStudentRewards]);

  const sortedUnits = useMemo(() => {
    if (!units) return [];
    return [...units].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [units]);

  const completedPct = useMemo(() => {
    try {
      if (!sortedUnits || sortedUnits.length === 0) return 0;
      const completedUnits = sortedUnits.filter(u => {
        if (!u || !u.questions) return false;
        return u.questions.every((_: any, i: number) => answers[`${u.id}-${i}`]?.is_done);
      }).length;
      return Math.round((completedUnits / sortedUnits.length) * 100);
    } catch (e) {
      console.error("Error calculating progress:", e);
      return 0;
    }
  }, [sortedUnits, answers]);

  const unitStatus = useMemo(() => {
    const status: Record<string, boolean> = {};
    if (!sortedUnits) return status;
    sortedUnits.forEach(u => {
      status[u.id] = u.questions.every((_: any, i: number) => answers[`${u.id}-${i}`]?.is_done);
    });
    return status;
  }, [sortedUnits, answers]);

  // REMOVED: Heavy Render Path Log to improve performance

  if (authLoading || loading) {
    return (
      <div id="loader" style={{ background: 'white' }}>
        <div className="loader-spinner"></div>
      </div>
    );
  }

  if (!projectMode) {
    return <ModeSelectionScreen />;
  }

  if (!role) {
    console.log("No role detected, showing LoginScreen");
    return <LoginScreen settings={settings} />;
  }

  if ((!units || units.length === 0) && role !== 'admin') {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        {/* Emblem Card Container */}
        <div style={{ 
          background: 'white', 
          padding: '40px', 
          borderRadius: 'var(--r-lg)', 
          boxShadow: 'var(--shadow-soft)',
          marginBottom: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'float 6s ease-in-out infinite'
        }}>
          <img 
            src={projectMode === 'afghan' ? tulipIcon : (projectMode === 'spanish' ? spanishEmblem : sarehEmblem)} 
            alt="Logo" 
            style={{ width: '220px', height: '220px', objectFit: 'contain' }} 
          />
        </div>
        <h3 style={{ color: 'var(--ink2)', marginBottom: '10px', fontSize: '24px' }}>{t.no_units}</h3>
        <p style={{ color: 'var(--ink4)', maxWidth: '400px', margin: '0 auto 24px' }}>
          {syncStatus === 'err' ? 'Erro de conexão com o banco de dados.' : (role === 'admin' ? t.no_units_desc_admin || 'Você pode começar criando sua primeira aula ou importando os padrões no Planejamento.' : t.no_units_desc)}
        </p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button className="primary-btn" onClick={() => window.location.reload()} style={{ padding: '12px 24px' }}>{t.retry}</button>
            <button 
             onClick={logout} 
             style={{ 
               padding: '12px 24px', 
               background: 'white', 
               border: '2px solid var(--border)', 
               borderRadius: '15px', 
               fontWeight: 900, 
               color: 'var(--ink3)',
               cursor: 'pointer'
             }}
           >
             {t.nav_logout_long || 'Sair / Trocar Comunidade'}
           </button>
        </div>
      </div>
    );
  }

  return (
    <div id="app">

      <div className="topbar">
        <div>
          <div className="topbar-logo">{t.title}</div>
          <div className="topbar-name" style={{ textAlign: 'left' }}>
            {user?.user_metadata?.full_name || t.student}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '11px', color: 'var(--ink4)' }}>
            {role === 'student' ? (user?.user_metadata?.full_name || t.student) : (settings?.med_name || t.role_teacher)}
          </span>
        </div>
      </div>

      {/* Admin View Toggle (Floating Pill) */}
      {role === 'admin' && (
        <div
          className="admin-view-toggle-pill"
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '6px 6px 6px 16px',
            background: isPreviewMode ? '#1e293b' : 'white',
            borderRadius: '30px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0,0,0,0.05)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{
              fontSize: '9px',
              fontWeight: 900,
              color: isPreviewMode ? '#94a3b8' : '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {t.view_mode}
            </span>
            <span style={{
              fontSize: '13px',
              fontWeight: 800,
              color: isPreviewMode ? 'white' : '#1e293b'
            }}>
              {isPreviewMode ? t.student : t.admin}
            </span>
          </div>

          <button
            onClick={() => {
              setIsPreviewMode(!isPreviewMode);
              if (!isPreviewMode) setActiveTab('adventure');
            }}
            style={{
              background: isPreviewMode ? '#fbbf24' : '#0ea5e9',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: 900,
              fontSize: '11px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {isPreviewMode ? (
              <><span>🔓</span> {t.exit_preview}</>
            ) : (
              <><span>👁️</span> {t.enter_preview}</>
            )}
          </button>
        </div>
      )}
      <aside className="sidebar-kids" style={{ background: 'rgba(216, 180, 216, 0.1)', backdropFilter: 'var(--glass)', borderRight: '1px solid var(--border)' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px', padding: '24px 0' }}>
          <img 
            src={projectMode === 'afghan' ? tulipIcon : (projectMode === 'spanish' ? spanishEmblem : sarehEmblem)} 
            alt="Projeto Logo" 
            style={{ width: '260px', height: '260px', objectFit: 'contain', marginBottom: '15px' }} 
          />
        </div>

        <button 
          className={`nav-link-kids adventure ${activeTab === 'adventure' ? 'active' : ''}`}
          onClick={() => { setActiveTab('adventure'); setActiveUnit(null); }}
          style={{ justifyContent: 'center', textAlign: 'center' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '22px', fontWeight: 900, lineHeight: 1 }}>{t.nav_classes}</span>
          </div>
        </button>

        {!isPreviewMode && role === 'admin' && (
          <button 
            className={`nav-link-kids planning ${activeTab === 'planning' ? 'active' : ''}`}
            onClick={() => setActiveTab('planning')}
            style={{ justifyContent: 'center', textAlign: 'center' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '18px', fontWeight: 900 }}>{t.nav_planning}</span>
            </div>
          </button>
        )}

        <button 
          className={`nav-link-kids whatsapp ${activeTab === 'whatsapp' ? 'active' : ''}`}
          onClick={() => { setActiveTab('whatsapp'); setActiveUnit(null); }}
          style={{ justifyContent: 'center', textAlign: 'center' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '22px', fontWeight: 900, lineHeight: 1 }}>{t.nav_help}</span>
          </div>
        </button>

        <div style={{ marginTop: 'auto', padding: '10px' }}>
           <button 
             className="nav-link-kids logout-btn-v5"
             onClick={logout}
             style={{ justifyContent: 'center', textAlign: 'center' }}
           >
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               <span style={{ fontSize: '18px', fontWeight: 900, lineHeight: 1 }}>{t.nav_logout}</span>
             </div>
           </button>
        </div>
      </aside>

      <div className="main-content-wrapper">
        <main className="screen active">
          {activeTab === 'adventure' && !activeUnit && (
            <Dashboard
              onNavigate={(screen, unitId) => {
                const unit = sortedUnits.find(u => u.id === unitId);
                if (unit) setActiveUnit(unit);
              }}
              completedPct={completedPct}
              sessionsCount={sessions.length}
              mediatorName={settings?.med_name || 'English classes'}
              mediatorPhone={settings?.med_phone || '5543999567378'}
              units={sortedUnits}
              answers={answers}
              isAdmin={role === 'admin' && !isPreviewMode}
              onUpdateUnit={updateUnit}
              onSyncDefaults={importDefaults}
              t={t}
            />
          )}

          {activeTab === 'adventure' && activeUnit && (
            <Activities
              units={sortedUnits}
              answers={answers}
              onSaveAnswer={saveAnswer}
              onSaveSession={saveSession}
              isAdmin={role === 'admin' && !isPreviewMode}
              isMediator={role === 'mediator'}
              onUpdateUnit={updateUnit}
              onCreateUnit={createUnit}
              onGameOver={handleGameOver}
              initialExpandedId={activeUnit.id}
              onGoHome={handleGoHome}
              onToggle={handleToggle}
            />
          )}
          {activeTab === 'planning' && role === 'admin' && (
            <div>
              {!editingUnitId ? (
                <>
                  <div className="back-row">
                    <button className="back-btn" onClick={() => setActiveTab('adventure')}>←</button>
                    <h2 className="screen-title" style={{ margin: 0 }}>{t.nav_planning}</h2>
                  </div>
                  <Planning
                    units={units}
                    sessions={sessions}
                    isAdmin={role === 'admin'}
                    settings={settings}
                    onUpdateUnit={(id, updates) => updateUnit(id, updates)}
                    onEditDetails={(id) => setEditingUnitId(id)}
                    onSaveSession={saveSession}
                    onResetProgress={resetUnitAnswers}
                    onImportDefaults={importDefaults}
                  />
                </>
              ) : (
                <PlanningEditor
                  unitId={editingUnitId}
                  onBack={() => setEditingUnitId(null)}
                  updateUnit={updateUnit}
                  units={units}
                />
              )}
            </div>
          )}

          {activeTab === 'activities' && (
            <Activities
              units={sortedUnits}
              answers={answers}
              onSaveAnswer={saveAnswer}
              onSaveSession={saveSession}
              isAdmin={role === 'admin' && !isPreviewMode}
              isMediator={role === 'mediator'}
              onUpdateUnit={updateUnit}
              onCreateUnit={createUnit}
              onGameOver={handleGameOver}
              onGoHome={handleGoAdventure}
              onToggle={handleGoAdventure}
            />
          )}
          {activeTab === 'whatsapp' && (
            <div>
              <div className="back-row">
                <button className="back-btn" onClick={() => setActiveTab('adventure')}>←</button>
                <h2 className="screen-title" style={{ margin: 0 }}>Assistente de Ajuda</h2>
              </div>
              <WhatsAppAssistant
                units={units}
                mediatorPhone={settings?.med_phone || '5543999567378'}
              />
            </div>
          )}
          {activeTab === 'settings' && (
            <div>
              <div className="back-row">
                <button className="back-btn" onClick={() => setActiveTab('adventure')}>←</button>
                <h2 className="screen-title" style={{ margin: 0 }}>Configurações</h2>
              </div>
              <div className="settings-section">
                <div className="settings-row">
                  <div className="settings-row-label">E-mail conectado</div>
                  <div className="settings-row-sub">{role === 'admin' ? 'Administrador' : 'Professor'}</div>
                </div>
              </div>
              <button className="logout-btn" onClick={logout}>Sair / Mudar perfil</button>
            </div>
          )}
        </main>
      </div>

      {celebration && (
        <div className="celebration-overlay">
          <div className="celebration-card">
            <span className="cel-trophy">🏆</span>
            <h2 className="cel-title">{t.celebration_title}</h2>
            <p className="cel-sub">{t.celebration_sub}</p>

            <div className="cel-rewards">
              <div className="cel-reward-item">
                <span className="cel-reward-val">+{celebration.xp}</span>
                <span className="cel-reward-lbl">XP</span>
              </div>
              <div className="cel-reward-item">
                <span className="cel-reward-val">+{celebration.stars}</span>
                <span className="cel-reward-lbl">Estrellas</span>
              </div>
            </div>

            <button className="cel-btn" onClick={() => setCelebration(null)}>
              {t.continue}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
