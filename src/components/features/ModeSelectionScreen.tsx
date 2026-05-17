import React from 'react';
import { useAuth } from '../../context/AuthContext';
import type { ProjectMode } from '../../context/AuthContext';
import spanishEmblem from '../../assets/Spanish cartoon emblem.jpeg';
import tulipIcon from '../../assets/tulip icon.jpeg';
import sarehEmblem from '../../assets/sareh emblem.jpeg';

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
          fontSize: '3.5rem',
          fontWeight: 900,
          color: '#0f172a',
          marginBottom: '10px',
          letterSpacing: '-2px',
          fontFamily: "'Fraunces', serif"
        }}>
          Projeto Pontes da Esperança
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: '#64748b',
          fontWeight: 600
        }}>
          Selecione sua comunidade de aprendizagem
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: '40px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: '1200px',
        width: '100%'
      }}>
        {/* Afghan Community Card */}
        <button
          onClick={() => handleSelect('afghan')}
          className="mode-card"
          style={{
            background: '#ffffff',
            border: '1px solid #f1f5f9',
            borderRadius: '45px',
            padding: '40px',
            width: '350px',
            cursor: 'pointer',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            boxShadow: '0 30px 60px -12px rgba(0,0,0,0.1), 0 18px 36px -18px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            outline: 'none',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{
            width: '220px',
            height: '220px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'white',
            borderRadius: '30px',
            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.06))'
          }}>
            <img src={tulipIcon} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Afghan Emblem" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Comunidade</div>
            <p style={{ margin: '0', fontSize: '1.8rem', color: '#0f172a', fontWeight: 900 }}>Afegã</p>
          </div>
          <div style={{
            marginTop: '10px',
            padding: '12px 40px',
            background: '#10b981',
            color: 'white',
            borderRadius: '25px',
            fontSize: '1rem',
            fontWeight: 900,
            textAlign: 'center',
            boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)'
          }}>
            ENTRAR
          </div>
        </button>

        {/* Spanish Community Card */}
        <button
          onClick={() => handleSelect('spanish')}
          className="mode-card"
          style={{
            background: '#ffffff',
            border: '1px solid #f1f5f9',
            borderRadius: '45px',
            padding: '40px',
            width: '350px',
            cursor: 'pointer',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            boxShadow: '0 30px 60px -12px rgba(0,0,0,0.1), 0 18px 36px -18px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            outline: 'none',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{
            width: '220px',
            height: '220px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'white',
            borderRadius: '30px',
            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.06))'
          }}>
            <img src={spanishEmblem} style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(1.4)' }} alt="Spanish Emblem" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Comunidade</div>
            <p style={{ margin: '0', fontSize: '1.8rem', color: '#0f172a', fontWeight: 900 }}>Hispana</p>
          </div>
          <div style={{
            marginTop: '10px',
            padding: '12px 40px',
            background: 'linear-gradient(45deg, #ef4444, #f59e0b)',
            color: 'white',
            borderRadius: '25px',
            fontSize: '1rem',
            fontWeight: 900,
            textAlign: 'center',
            boxShadow: '0 10px 20px rgba(239, 68, 68, 0.3)'
          }}>
            ENTRAR
          </div>
        </button>

        {/* SAREH Community Card */}
        <button
          onClick={() => handleSelect('sareh')}
          className="mode-card"
          style={{
            background: '#ffffff',
            border: '1px solid #f1f5f9',
            borderRadius: '45px',
            padding: '40px',
            width: '350px',
            cursor: 'pointer',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            boxShadow: '0 30px 60px -12px rgba(0,0,0,0.1), 0 18px 36px -18px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            outline: 'none',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{
            width: '220px',
            height: '220px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'white',
            borderRadius: '30px',
            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.06))'
          }}>
            <img src={sarehEmblem} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Sareh Emblem" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Comunidade</div>
            <p style={{ margin: '0', fontSize: '1.8rem', color: '#0f172a', fontWeight: 900 }}>SAREH - Apoio</p>
          </div>
          <div style={{
            marginTop: '10px',
            padding: '12px 40px',
            background: 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
            color: 'white',
            borderRadius: '25px',
            fontSize: '1rem',
            fontWeight: 900,
            textAlign: 'center',
            boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)'
          }}>
            ENTRAR
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
