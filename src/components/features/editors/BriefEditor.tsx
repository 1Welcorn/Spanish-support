import React, { useState, useEffect } from 'react';
import type { Unit, ExternalLink } from '../../../types';
import { Zap, X } from 'lucide-react';
import { RichTextEditor, VideoPlayerV5 } from '../Activities';

interface BriefEditorProps {
  unit: Unit;
  projectMode: string;
  mainTitle: string;
  secondaryTitle?: string;
  tertiaryTitle?: string;
  handleUpdateUnitContent: (updates: Partial<Unit>) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}

export const BriefEditor: React.FC<BriefEditorProps> = ({
  unit,
  projectMode,
  mainTitle,
  secondaryTitle,
  tertiaryTitle,
  handleUpdateUnitContent,
  onClose
}) => {
  const [tempBrief, setTempBrief] = useState(unit.brief || '');
  const [tempLinks, setTempLinks] = useState<ExternalLink[]>(unit.external_links || []);
  const [expandedVideoIdxs, setExpandedVideoIdxs] = useState<Record<number, boolean>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    setTempBrief(unit.brief || '');
    setTempLinks(unit.external_links || []);
  }, [unit]);

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const result = await handleUpdateUnitContent({
        brief: tempBrief,
        external_links: tempLinks.map(l => ({ ...l }))
      });
      if (result && result.success === true) {
        setSaveStatus('success');
        setTimeout(() => {
          setSaveStatus('idle');
          onClose();
        }, 800);
      } else {
        setSaveStatus('error');
        alert('Erro ao salvar: ' + (result?.error || 'Erro desconhecido'));
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (err: any) {
      console.error('Exception while saving unit content:', err);
      setSaveStatus('error');
      alert('Erro crítico ao salvar: ' + (err.message || 'Erro de conexão/permissão'));
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  return (
    <div className="brief-editor-overlay-v7" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#f8fafc', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '15px 30px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Zap size={24} color="#f59e0b" fill="#f59e0b" />
          <h2 style={{ margin: 0, fontWeight: 900 }}>Editor Mestre Ultra Rápido ⚡</h2>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleSave} style={{ background: '#10b981', color: 'white', padding: '10px 25px', borderRadius: '12px', border: 'none', fontWeight: 900, cursor: 'pointer' }}>
            {saveStatus === 'saving' ? 'Salvando...' : saveStatus === 'success' ? 'Salvo ✓' : 'Salvar Alterações'}
          </button>
          <button onClick={onClose} style={{ background: '#f1f5f9', padding: '10px', borderRadius: '12px', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 340px 1fr', gap: '20px', padding: '20px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h4 style={{ margin: 0, color: '#64748b', fontSize: '11px', fontWeight: 900 }}>1. CONTEÚDO</h4>
          <RichTextEditor value={tempBrief} onChange={setTempBrief} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', paddingRight: '10px' }}>
          <h4 style={{ margin: 0, color: '#64748b', fontSize: '11px', fontWeight: 900 }}>2. DIMENSÕES DO VÍDEO</h4>
          {tempLinks.map((link, lIdx) => (
            <div key={lIdx} style={{ background: 'white', padding: '15px', borderRadius: '16px', border: '2px solid #f59e0b', marginBottom: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
              <input type="text" value={link.url} placeholder="Link do vídeo (Padrão)..." style={{ width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '10px', border: '1px solid #cbd5e1' }} onChange={(e) => { const nl = [...tempLinks]; nl[lIdx].url = e.target.value; setTempLinks(nl); }} />
              <input type="text" value={link.url_spanish || ''} placeholder="Link do vídeo em Espanhol..." style={{ width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '10px', border: '1px solid #fee2e2' }} onChange={(e) => { const nl = [...tempLinks]; nl[lIdx].url_spanish = e.target.value; setTempLinks(nl); }} />
              <input type="text" value={link.url_afghan || ''} placeholder="Link do vídeo em Dari (Afegão)..." style={{ width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '10px', border: '1px solid #d1fae5' }} onChange={(e) => { const nl = [...tempLinks]; nl[lIdx].url_afghan = e.target.value; setTempLinks(nl); }} />
              <input type="text" value={link.url_sareh || ''} placeholder="Link do vídeo em Sareh..." style={{ width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '10px', border: '1px solid #dbeafe' }} onChange={(e) => { const nl = [...tempLinks]; nl[lIdx].url_sareh = e.target.value; setTempLinks(nl); }} />
              <button 
                type="button"
                onClick={() => setExpandedVideoIdxs(prev => ({ ...prev, [lIdx]: !prev[lIdx] }))}
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  background: '#fffbeb', 
                  border: '2px solid #f59e0b', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  fontWeight: 800, 
                  fontSize: '12px',
                  color: '#d97706',
                  cursor: 'pointer',
                  marginBottom: '10px',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>⚙️ Ajustes de Dimensões</span>
                <span>{expandedVideoIdxs[lIdx] ? '▲ Recolher' : '▼ Expandir'}</span>
              </button>

              {expandedVideoIdxs[lIdx] && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: '#fafafb', padding: '12px', borderRadius: '12px', border: '1px dashed #e2e8f0', marginTop: '5px', marginBottom: '10px' }}>
                  <div className="control-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 900, color: '#64748b', marginBottom: '4px' }}><span>LARGURA DO PLAYER: {link.width || '100%'}</span></div>
                    <input type="range" min="10" max="100" step="5" value={link.width && link.width.includes('%') ? parseInt(link.width) : (link.width && link.width.includes('px') ? Math.min(100, Math.round(parseInt(link.width)/10)) : 100)} style={{ width: '100%', accentColor: '#f59e0b' }} onChange={(e) => { const nl = [...tempLinks]; nl[lIdx].width = `${e.target.value}%`; setTempLinks(nl); }} />
                  </div>
                  <div className="control-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 900, color: '#64748b', marginBottom: '4px' }}><span>ALTURA DO PLAYER: {link.height || 300}px</span></div>
                    <input type="range" min="50" max="1000" step="5" value={link.height || 300} style={{ width: '100%', accentColor: '#f59e0b' }} onChange={(e) => { const nl = [...tempLinks]; nl[lIdx].height = parseInt(e.target.value); setTempLinks(nl); }} />
                  </div>
                  <div className="control-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 900, color: '#64748b', marginBottom: '4px' }}><span>BORDAS DO QUADRO: {link.borderRadius !== undefined ? link.borderRadius : 20}px</span></div>
                    <input type="range" min="0" max="100" step="1" value={link.borderRadius !== undefined ? link.borderRadius : 20} style={{ width: '100%', accentColor: '#f59e0b' }} onChange={(e) => { const nl = [...tempLinks]; nl[lIdx].borderRadius = parseInt(e.target.value); setTempLinks(nl); }} />
                  </div>
                  <div className="control-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 900, color: '#64748b', marginBottom: '4px' }}><span>BORDAS DO PLAYER: {link.playerBorderRadius !== undefined ? link.playerBorderRadius : (link.borderRadius !== undefined ? link.borderRadius : 20)}px</span></div>
                    <input type="range" min="0" max="100" step="1" value={link.playerBorderRadius !== undefined ? link.playerBorderRadius : (link.borderRadius !== undefined ? link.borderRadius : 20)} style={{ width: '100%', accentColor: '#f59e0b' }} onChange={(e) => { const nl = [...tempLinks]; nl[lIdx].playerBorderRadius = parseInt(e.target.value); setTempLinks(nl); }} />
                  </div>
                  <div className="control-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 900, color: '#64748b', marginBottom: '4px' }}><span>ZOOM DA IMAGEM/VÍDEO: {link.scale || 1}x</span></div>
                    <input type="range" min="0.5" max="3" step="0.1" value={link.scale || 1} style={{ width: '100%', accentColor: '#f59e0b' }} onChange={(e) => { const nl = [...tempLinks]; nl[lIdx].scale = parseFloat(e.target.value); setTempLinks(nl); }} />
                  </div>
                  <div className="control-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 900, color: '#64748b', marginBottom: '4px' }}><span>ESPESSURA DO QUADRO: {link.framePadding || '0px'}</span></div>
                    <input type="range" min="0" max="50" step="1" value={parseInt(link.framePadding || '0')} style={{ width: '100%', accentColor: '#f59e0b' }} onChange={(e) => { const nl = [...tempLinks]; nl[lIdx].framePadding = `${e.target.value}px`; setTempLinks(nl); }} />
                  </div>
                  <div className="control-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 900, color: '#64748b', marginBottom: '4px' }}><span>COR DO QUADRO:</span></div>
                    <select value={link.frameColor || ''} style={{ width: '100%', padding: '8px', borderRadius: '8px', fontSize: '12px' }} onChange={(e) => { const nl = [...tempLinks]; nl[lIdx].frameColor = e.target.value; setTempLinks(nl); }}>
                      <option value="">Padrão (Preto/Transp.)</option>
                      <option value="transparent">Transparente (Vazio)</option>
                      <option value="white">Branco</option>
                      <option value="#fef3c7">Beige</option>
                      <option value="#000000">Preto</option>
                      <option value="#fbbf24">Amarelo</option>
                      <option value="#3b82f6">Azul</option>
                    </select>
                  </div>
                  <div className="control-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 900, color: '#64748b', marginBottom: '4px' }}><span>ATRASO DE INÍCIO: {link.delay || 0}s</span></div>
                    <input type="range" min="0" max="15" step="0.5" value={link.delay || 0} style={{ width: '100%', accentColor: '#10b981' }} onChange={(e) => { const nl = [...tempLinks]; nl[lIdx].delay = parseFloat(e.target.value); setTempLinks(nl); }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '9px', fontWeight: 900, color: '#94a3b8' }}>AJUSTE (OBJ-FIT)</label>
                      <select value={link.objectFit || 'cover'} style={{ fontSize: '12px', padding: '8px', borderRadius: '8px' }} onChange={(e) => { const nl = [...tempLinks]; nl[lIdx].objectFit = e.target.value; setTempLinks(nl); }}>
                        <option value="cover">Llenar (Sin Barras)</option>
                        <option value="contain">Ajustar (Con Barras)</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '9px', fontWeight: 900, color: '#94a3b8' }}>TIPO</label>
                      <select value={link.label} style={{ fontSize: '12px', padding: '8px', borderRadius: '8px' }} onChange={(e) => { const nl = [...tempLinks]; nl[lIdx].label = e.target.value; setTempLinks(nl); }}>
                        <option value="video">🎥 Video</option>
                        <option value="media">🖼️ Imagen</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <button type="button" onClick={() => setTempLinks(tempLinks.filter((_, i) => i !== lIdx))} style={{ width: '100%', marginTop: '15px', background: '#fee2e2', color: '#ef4444', border: 'none', padding: '10px', borderRadius: '12px', fontWeight: 900, cursor: 'pointer' }}>EXCLUIR</button>
            </div>
          ))}
          <button type="button" onClick={() => setTempLinks([...tempLinks, { label: 'video', url: '', width: '100%', height: 350, objectFit: 'cover' }])} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 900, fontSize: '11px', cursor: 'pointer', marginBottom: '20px' }}>+ ADICIONAR NOVO VÍDEO</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', background: '#f1f5f9', borderRadius: '24px', overflow: 'hidden', height: '100%' }}>
          <div style={{ padding: '10px', background: '#e2e8f0', textAlign: 'center', fontSize: '10px', fontWeight: 900, width: '100%' }}>SIMULADOR EM TEMPO REAL (100% FIDELIDADE) 📺</div>
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
            <div className="mission-intro-card-v7 dynamic-wrap-v7" style={{ width: '100%', maxWidth: '800px', background: 'white', border: '1px solid #e2e8f0', margin: '0 auto' }}>
              <div className="mission-content-v7">
                <span className="mission-tag-v7">GUIA DE ESTUDO</span>
                <h1 className="mission-subtitle-v7 main-theme" style={{ direction: projectMode === 'afghan' ? 'rtl' : 'ltr' }}>
                  {mainTitle}
                </h1>
                {secondaryTitle && <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink4)', marginTop: '-15px', marginBottom: '4px' }}>{secondaryTitle}</div>}
                {tertiaryTitle && <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink3)', fontStyle: 'italic', marginBottom: '15px' }}>{tertiaryTitle}</div>}
                <div dangerouslySetInnerHTML={{ __html: tempBrief }} style={{ fontSize: '16px', lineHeight: '1.6' }} />
              </div>
              <div className="mission-media-v7">
                {tempLinks.map((media, i) => <VideoPlayerV5 key={i} media={media} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
