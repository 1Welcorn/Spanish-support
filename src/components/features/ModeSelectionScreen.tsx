import React from 'react';
import { useAuth } from '../../context/AuthContext';
import type { ProjectMode } from '../../context/AuthContext';
import { Globe, Sparkles } from 'lucide-react';

export const ModeSelectionScreen: React.FC = () => {
  const { setProjectMode } = useAuth();

  const handleSelect = (mode: ProjectMode) => {
    setProjectMode(mode);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'Outfit', sans-serif"
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '50px',
        animation: 'fadeInDown 0.8s ease-out'
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 900,
          color: '#0f172a',
          marginBottom: '10px',
          letterSpacing: '-1px'
        }}>
          Proyecto Puentes de Esperanza
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: '#64748b',
          fontWeight: 500
        }}>
          Selecciona tu comunidad de aprendizaje
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: '40px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: '1000px',
        width: '100%'
      }}>
        {/* Afghan Community Card */}
        <button 
          onClick={() => handleSelect('afghan')}
          className="mode-card"
          style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '40px',
            padding: '40px',
            width: '320px',
            cursor: 'pointer',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            outline: 'none'
          }}
        >
          <div style={{
            width: '120px',
            height: '120px',
            background: 'linear-gradient(45deg, #10b981, #059669)',
            borderRadius: '35px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 15px 30px rgba(16, 185, 129, 0.3)'
          }}>
            <Globe size={60} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: '#0f172a' }}>Pashto & Dari</h2>
            <p style={{ margin: '5px 0 0', color: '#64748b', fontWeight: 600 }}>Comunidad Afgana</p>
          </div>
          <div style={{
            marginTop: '10px',
            padding: '10px 20px',
            background: '#ecfdf5',
            color: '#059669',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Sparkles size={16} /> ENTRAR
          </div>
        </button>

        {/* Spanish Community Card */}
        <button 
          onClick={() => handleSelect('spanish')}
          className="mode-card"
          style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '40px',
            padding: '40px',
            width: '320px',
            cursor: 'pointer',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            outline: 'none'
          }}
        >
          <div style={{
            width: '120px',
            height: '120px',
            background: 'linear-gradient(45deg, #ef4444, #f59e0b)',
            borderRadius: '35px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 15px 30px rgba(239, 68, 68, 0.3)'
          }}>
            <Globe size={60} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: '#0f172a' }}>Español</h2>
            <p style={{ margin: '5px 0 0', color: '#64748b', fontWeight: 600 }}>Comunidad Hispana</p>
          </div>
          <div style={{
            marginTop: '10px',
            padding: '10px 20px',
            background: '#fff7ed',
            color: '#c2410c',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Sparkles size={16} /> ENTRAR
          </div>
        </button>
      </div>

      <style>{`
        .mode-card:hover {
          transform: translateY(-15px) scale(1.05);
          background: white !important;
          box-shadow: 0 30px 60px rgba(0,0,0,0.1) !important;
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
