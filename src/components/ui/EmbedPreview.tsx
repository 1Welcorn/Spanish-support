import React, { useRef, useState, useImperativeHandle, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Zap, X } from 'lucide-react';

export type EmbedPreviewHandle = {
  open: () => void;
  close: () => void;
};

// Partículas decorativas flutuantes
const PARTICLES = [
  { emoji: '✨', top: '12%', left: '10%', delay: '0s',   size: '22px', dur: '3.2s' },
  { emoji: '⭐', top: '70%', left: '8%',  delay: '0.6s', size: '16px', dur: '2.8s' },
  { emoji: '🌟', top: '20%', left: '82%', delay: '1.1s', size: '20px', dur: '3.5s' },
  { emoji: '✨', top: '75%', left: '85%', delay: '0.3s', size: '18px', dur: '2.5s' },
  { emoji: '💫', top: '45%', left: '5%',  delay: '1.8s', size: '14px', dur: '4s'   },
  { emoji: '⚡', top: '10%', left: '50%', delay: '0.9s', size: '16px', dur: '3s'   },
];

const EmbedPreview = React.forwardRef<EmbedPreviewHandle, { url: string; title?: string; thumbnailUrl?: string; maskIcon?: string; maskSize?: number }>((props, ref) => {
  const { url, title, thumbnailUrl, maskIcon, maskSize } = props;
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement && open) setOpen(false);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, [open]);

  const openFullscreen = () => {
    setOpen(true);
    setTimeout(() => {
      const el = modalRef.current;
      if (el && el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      }
    }, 150);
  };

  const closeFullscreen = async () => {
    if (document.fullscreenElement) {
      try { await document.exitFullscreen(); } catch {}
    }
    setOpen(false);
  };

  useImperativeHandle(ref, () => ({ open: openFullscreen, close: closeFullscreen }));

  const iconSize = maskSize || 240;

  const modalContent = open && (
    <div className="embed-modal" ref={modalRef}>
      <button className="embed-modal-close-mini" onClick={closeFullscreen}>
        <X size={32} />
      </button>
      <iframe
        src={url}
        title={title || 'Actividad interactiva'}
        allow="fullscreen; autoplay; clipboard-read; clipboard-write"
        allowFullScreen
        className="game-iframe-v6"
      />
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes ep-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
          50% { transform: translateY(-12px) rotate(8deg); opacity: 1; }
        }
        @keyframes ep-pulse-ring {
          0% { transform: scale(0.92); opacity: 0.8; }
          50% { transform: scale(1.06); opacity: 0.4; }
          100% { transform: scale(0.92); opacity: 0.8; }
        }
        @keyframes ep-glow {
          0%, 100% { box-shadow: 0 0 30px rgba(16,185,129,0.35), 0 0 60px rgba(16,185,129,0.15); }
          50% { box-shadow: 0 0 50px rgba(16,185,129,0.6), 0 0 100px rgba(16,185,129,0.25); }
        }
        @keyframes ep-icon-bob {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.04); }
        }
        @keyframes ep-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .ep-wrapper {
          position: relative;
          width: 100%;
          max-width: 520px;
          cursor: pointer;
          user-select: none;
          padding: 8px;
        }

        /* Anel pulsante de fundo */
        .ep-pulse-ring {
          position: absolute;
          inset: -12px;
          border-radius: 44px;
          background: radial-gradient(ellipse, rgba(16,185,129,0.18) 0%, transparent 70%);
          animation: ep-pulse-ring 2.4s ease-in-out infinite;
          pointer-events: none;
          z-index: 0;
        }

        /* Painel glassmorphism principal */
        .ep-glass-panel {
          position: relative;
          z-index: 1;
          border-radius: 36px;
          background: rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1.5px solid rgba(255, 255, 255, 0.45);
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.12),
            0 2px 8px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.6);
          padding: 32px 24px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.35s ease,
                      border-color 0.35s ease;
          overflow: hidden;
        }
        .ep-glass-panel::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
        }

        .ep-wrapper:hover .ep-glass-panel {
          transform: translateY(-4px) scale(1.015);
          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.18),
            0 8px 20px rgba(16, 185, 129, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.7);
          border-color: rgba(16, 185, 129, 0.5);
        }

        /* Partículas flutuantes */
        .ep-particle {
          position: absolute;
          pointer-events: none;
          z-index: 2;
          animation: ep-float var(--dur) ease-in-out infinite;
          animation-delay: var(--delay);
          transition: opacity 0.3s;
        }

        /* Container do ícone */
        .ep-icon-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Halo brilhante atrás do ícone */
        .ep-icon-halo {
          position: absolute;
          width: 140%;
          height: 140%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(251,191,36,0.25) 0%, rgba(16,185,129,0.1) 50%, transparent 70%);
          animation: ep-pulse-ring 3s ease-in-out infinite;
          pointer-events: none;
        }

        /* Ícone temático */
        .ep-icon-img {
          position: relative;
          z-index: 1;
          animation: ep-icon-bob 3.5s ease-in-out infinite;
          filter: drop-shadow(0 12px 28px rgba(0,0,0,0.18));
          transition: transform 0.3s ease;
        }
        .ep-wrapper:hover .ep-icon-img {
          filter: drop-shadow(0 18px 40px rgba(16,185,129,0.3));
        }

        /* Fallback sem ícone */
        .ep-no-icon {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          animation: ep-icon-bob 3.5s ease-in-out infinite;
        }
        .ep-no-icon-emoji {
          font-size: 80px;
          filter: drop-shadow(0 8px 20px rgba(0,0,0,0.15));
        }

        /* Thumbnail */
        .ep-thumbnail {
          width: 100%;
          border-radius: 20px;
          object-fit: cover;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }

        /* Botão de play */
        .ep-play-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          max-width: 260px;
          padding: 14px 28px;
          border: none;
          border-radius: 100px;
          background: linear-gradient(135deg, #10b981 0%, #059669 50%, #0891b2 100%);
          background-size: 200% auto;
          color: white;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow:
            0 6px 24px rgba(16, 185, 129, 0.5),
            0 2px 8px rgba(0,0,0,0.15);
          animation: ep-glow 2.5s ease-in-out infinite;
          transition: transform 0.2s ease, filter 0.2s ease;
        }
        .ep-play-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 100px;
          background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 60%);
          pointer-events: none;
        }
        .ep-wrapper:hover .ep-play-btn {
          transform: scale(1.05);
          filter: brightness(1.1);
        }

        /* Chip de tipo de atividade */
        .ep-activity-chip {
          position: absolute;
          top: 14px;
          right: 16px;
          background: rgba(255,255,255,0.3);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.5);
          border-radius: 100px;
          padding: 4px 10px;
          font-size: 10px;
          font-weight: 800;
          color: rgba(255,255,255,0.95);
          letter-spacing: 0.8px;
          text-transform: uppercase;
          text-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
      `}</style>

      <div
        className="ep-wrapper"
        role="button"
        aria-label={`Abrir atividade: ${title || 'Atividade interativa'}`}
        onClick={openFullscreen}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Anel de pulso de fundo */}
        <div className="ep-pulse-ring" />

        {/* Partículas flutuantes */}
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="ep-particle"
            style={{
              top: p.top,
              left: p.left,
              fontSize: p.size,
              '--delay': p.delay,
              '--dur': p.dur,
              opacity: hovered ? 1 : 0.55,
            } as React.CSSProperties}
          >
            {p.emoji}
          </span>
        ))}

        {/* Painel de vidro */}
        <div className="ep-glass-panel">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={title || 'Preview'} className="ep-thumbnail" />
          ) : (
            <div className="ep-icon-wrap">
              {/* Halo brilhante */}
              <div className="ep-icon-halo" />

              {maskIcon ? (
                <img
                  src={maskIcon}
                  alt="Ícone temático"
                  className="ep-icon-img"
                  style={{
                    width: `${iconSize}px`,
                    height: `${iconSize}px`,
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <div className="ep-no-icon">
                  <span className="ep-no-icon-emoji">🎯</span>
                  <span style={{ fontSize: '11px', fontWeight: 900, color: 'rgba(255,255,255,0.7)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                    Surpresa!
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Botão de play */}
          <button className="ep-play-btn" tabIndex={-1}>
            <Zap size={15} fill="white" />
            Toque para Jogar
          </button>
        </div>
      </div>

      {open && createPortal(modalContent, document.body)}
    </>
  );
});

export default EmbedPreview;
