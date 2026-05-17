import React from 'react';
import { useAuth, CUSTOM_STUDENTS } from '../../context/AuthContext';
import { translations } from '../../constants/translations';
import projectLogo from '../../assets/tulip icon.png';
import tulipIcon from '../../assets/tulip icon.png';
import spanishEmblem from '../../assets/Spanish cartoon emblem.png';
import sarehEmblem from '../../assets/sareh emblem.png';
import { User, Lock, ArrowRight } from 'lucide-react';

const StudentLoginCard: React.FC<{ name: string; t: any }> = ({ name, t }) => {
  const [pin, setPin] = React.useState('');
  const [showPin, setShowPin] = React.useState(false);
  const { signInWithName, loading } = useAuth();

  const handleLogin = async () => {
    if (!pin) return;
    await signInWithName(name, pin);
  };

  if (!showPin) {
    return (
      <div
        className="student-card-v5"
        onClick={() => setShowPin(!showPin)}
        style={{
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ background: 'var(--color-accent-blue)', color: 'white', padding: '10px', borderRadius: '14px' }}>
          <User size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900, color: 'var(--ink1)', fontSize: '14px', letterSpacing: '0.5px' }}>{name}</div>
          <div style={{ fontSize: '11px', color: 'var(--ink4)', fontWeight: 600 }}>{t.login_click_to_enter}</div>
        </div>
        <ArrowRight size={16} color="var(--border)" />
      </div>
    );
  }

  return (
    <div style={{ background: 'white', border: '2px solid var(--color-accent-blue)', borderRadius: '24px', padding: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', position: 'relative' }}>
      <button onClick={() => setShowPin(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--ink4)', cursor: 'pointer', fontSize: '12px' }}>voltar</button>
      <div style={{ fontWeight: 900, fontSize: '16px', marginBottom: '15px', textAlign: 'center', color: 'var(--color-accent-blue)' }}>{name}</div>
      <div style={{ position: 'relative', marginBottom: '15px' }}>
        <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink4)' }}><Lock size={16} /></div>
        <input
          type="password"
          placeholder="Digite sua senha..."
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          autoFocus
          style={{
            width: '100%',
            padding: '12px 12px 12px 40px',
            borderRadius: '14px',
            border: '1.5px solid var(--border)',
            fontSize: '14px',
            outline: 'none'
          }}
        />
      </div>
      <button
        onClick={handleLogin}
        disabled={loading || !pin}
        style={{
          width: '100%',
          background: 'var(--color-accent-blue)',
          color: 'white',
          border: 'none',
          padding: '12px',
          borderRadius: '14px',
          fontWeight: 900,
          cursor: 'pointer',
          opacity: loading || !pin ? 0.6 : 1
        }}
      >
        {loading ? 'Entrando...' : 'CONFIRMAR'}
      </button>
    </div>
  );
};

export const LoginScreen: React.FC<{ settings: any }> = () => {
  const {
    signInWithGoogle,
    loading,
    authError,
    projectMode,
    setProjectMode
  } = useAuth();

  const t = translations[projectMode || 'spanish'];

  // Pick the right emblem based on mode
  let currentEmblem = projectLogo;
  if (projectMode === 'afghan') currentEmblem = tulipIcon;
  else if (projectMode === 'spanish') currentEmblem = spanishEmblem;
  else if (projectMode === 'sareh') currentEmblem = sarehEmblem;

  return (
    <div id="login-screen">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img src={currentEmblem} alt="Logo" style={{ height: '150px', width: 'auto', maxWidth: '240px', objectFit: 'contain' }} />
          {/* TITULO DINAMICO */}
          <div style={{ 
            display: 'flex', 
            flexDirection: projectMode === 'spanish' ? 'column' : 'column', // Mantendo coluna para o container principal
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '4px', 
            marginBottom: '12px' 
          }}>
            {projectMode === 'spanish' ? (
              <>
                <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--color-foliage)', margin: 0 }}>
                  {t.login_welcome.split(' / ')[0]}
                </h1>
                <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--color-foliage)', margin: 0, opacity: 0.9 }}>
                  {t.login_welcome.split(' / ')[1]}
                </h1>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                <h1 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--color-foliage)', margin: 0 }}>
                  {t.login_welcome.split(' / ')[0]}
                </h1>
                {t.login_welcome.includes(' / ') && (
                  <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--color-foliage)', margin: 0, direction: 'rtl', opacity: 0.9 }}>
                    {t.login_welcome.split(' / ')[1]}
                  </h1>
                )}
              </div>
            )}
            <p style={{ fontSize: '13px', color: 'var(--ink4)', fontWeight: 600, margin: 0 }}>
              (Welcome!)
            </p>
          </div>

          {/* SUBTITULO DINAMICO */}
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {projectMode === 'spanish' ? (
              <>
                <p style={{ fontSize: '15px', color: 'var(--ink3)', fontWeight: 700, margin: 0 }}>
                  {t.login_sub.split(' / ')[0]}
                </p>
                <p style={{ fontSize: '14px', color: 'var(--ink3)', fontWeight: 600, margin: 0, opacity: 0.8 }}>
                  {t.login_sub.split(' / ')[1]}
                </p>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                <p style={{ fontSize: '14px', color: 'var(--ink3)', fontWeight: 700, margin: 0 }}>
                  {t.login_sub.split(' / ')[0]}
                </p>
                {t.login_sub.includes(' / ') && (
                  <p style={{ fontSize: '13px', color: 'var(--ink3)', fontWeight: 600, margin: 0, direction: 'rtl', opacity: 0.8 }}>
                    {t.login_sub.split(' / ')[1]}
                  </p>
                )}
              </div>
            )}
            <p style={{ fontSize: '12px', color: 'var(--ink4)', opacity: 0.8, margin: 0 }}>
              (Your learning platform)
            </p>
          </div>
        </div>

        {authError && (
          <div className="auth-error-message" style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '20px',
            border: '1px solid #fecaca'
          }}>
            {authError}
          </div>
        )}

        {loading ? (
          <div className="loader-spinner" style={{ margin: '0 auto' }}></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Google Login for Admin/Mediator */}
            <button
              className="login-btn"
              onClick={signInWithGoogle}
              style={{
                background: '#fff',
                border: '1.5px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                padding: '16px 20px',
                width: '100%',
                gap: '12px',
                borderRadius: '16px'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: 800, fontSize: '15px' }}>Admin / Professor</span>
              </div>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', margin: '16px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
              <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--ink4)', letterSpacing: '1px' }}>
                {t.login_student_access}
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
            </div>

            {/* Student Login Options (Filtered by Community) */}
            <div style={{ display: 'grid', gap: '12px' }}>
              {CUSTOM_STUDENTS
                .filter(student => student.mode === projectMode)
                .map(student => (
                  <StudentLoginCard key={student.name} name={student.name} t={t} />
                ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: '30px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
          <button
            onClick={() => {
              localStorage.removeItem('dari_project_mode');
              setProjectMode(null);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-accent-blue)',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {t.login_back}
          </button>
        </div>

        <div style={{ marginTop: '20px', fontSize: '11px', color: 'var(--ink4)', textAlign: 'center' }}>
          {t.login_footer}
        </div>
      </div>
    </div>
  );
};
