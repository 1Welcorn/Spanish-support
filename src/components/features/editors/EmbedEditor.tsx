import React, { useState, useEffect } from 'react';
import type { Unit } from '../../../types';
import { Zap, X } from 'lucide-react';
import { RichTextEditor, normalizeEmbedUrl } from '../Activities';
import EmbedPreview from '../../ui/EmbedPreview';

interface EmbedEditorProps {
  unit: Unit;
  editingEmbedIdx: number;
  projectMode: string;
  mainTitle: string;
  handleUpdateUnitContent: (updates: Partial<Unit>) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
  onChange?: (updates: any) => void;
}

export const EmbedEditor: React.FC<EmbedEditorProps> = ({
  unit,
  editingEmbedIdx,
  projectMode,
  mainTitle,
  handleUpdateUnitContent,
  onClose,
  onChange
}) => {
  const act = (unit.embed_urls?.[editingEmbedIdx] as any) || {};

  const [tempEmbedTitle, setTempEmbedTitle] = useState(act.title || '');
  const [tempEmbedTitleSpanish, setTempEmbedTitleSpanish] = useState(act.title_spanish || '');
  const [tempEmbedTitleAfghan, setTempEmbedTitleAfghan] = useState(act.title_afghan || '');
  const [tempEmbedTitleSareh, setTempEmbedTitleSareh] = useState(act.title_sareh || '');
  const [tempEmbedUrl, setTempEmbedUrl] = useState(act.url || '');
  const [tempEmbedSpanish, setTempEmbedSpanish] = useState(act.url_spanish || '');
  const [tempEmbedAfghan, setTempEmbedAfghan] = useState(act.url_afghan || '');
  const [tempEmbedSareh, setTempEmbedSareh] = useState(act.url_sareh || '');
  const [tempEmbedBrief, setTempEmbedBrief] = useState(act.brief || '');
  const [tempEmbedWidth, setTempEmbedWidth] = useState(act.width || '100%');
  const [tempEmbedHeight, setTempEmbedHeight] = useState(act.height || 600);
  const [tempEmbedBorderRadius, setTempEmbedBorderRadius] = useState(act.borderRadius !== undefined ? act.borderRadius : 40);
  const [tempEmbedPlayerBorderRadius, setTempEmbedPlayerBorderRadius] = useState(act.playerBorderRadius !== undefined ? act.playerBorderRadius : (act.borderRadius !== undefined ? act.borderRadius : 40));
  const [tempEmbedScale, setTempEmbedScale] = useState(act.scale || 1);
  const [tempEmbedFramePadding, setTempEmbedFramePadding] = useState(act.framePadding || '0px');
  const [tempEmbedFrameColor, setTempEmbedFrameColor] = useState(act.frameColor || '');
  const [tempEmbedMysteryIcon, setTempEmbedMysteryIcon] = useState(act.mystery_icon || '');
  const [tempEmbedMysteryIconSize, setTempEmbedMysteryIconSize] = useState(act.mystery_icon_size || 280);

  const [expandedDesign, setExpandedDesign] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    const freshAct = (unit.embed_urls?.[editingEmbedIdx] as any) || {};
    setTempEmbedTitle(freshAct.title || '');
    setTempEmbedTitleSpanish(freshAct.title_spanish || '');
    setTempEmbedTitleAfghan(freshAct.title_afghan || '');
    setTempEmbedTitleSareh(freshAct.title_sareh || '');
    setTempEmbedUrl(freshAct.url || '');
    setTempEmbedSpanish(freshAct.url_spanish || '');
    setTempEmbedAfghan(freshAct.url_afghan || '');
    setTempEmbedSareh(freshAct.url_sareh || '');
    setTempEmbedBrief(freshAct.brief || '');
    setTempEmbedWidth(freshAct.width || '100%');
    setTempEmbedHeight(freshAct.height || 600);
    setTempEmbedBorderRadius(freshAct.borderRadius !== undefined ? freshAct.borderRadius : 40);
    setTempEmbedPlayerBorderRadius(freshAct.playerBorderRadius !== undefined ? freshAct.playerBorderRadius : (freshAct.borderRadius !== undefined ? freshAct.borderRadius : 40));
    setTempEmbedScale(freshAct.scale || 1);
    setTempEmbedFramePadding(freshAct.framePadding || '0px');
    setTempEmbedFrameColor(freshAct.frameColor || '');
    setTempEmbedMysteryIcon(freshAct.mystery_icon || '');
    setTempEmbedMysteryIconSize(freshAct.mystery_icon_size || 280);
  }, [unit, editingEmbedIdx]);

  useEffect(() => {
    if (onChange) {
      onChange({
        title: tempEmbedTitle,
        title_spanish: tempEmbedTitleSpanish,
        title_afghan: tempEmbedTitleAfghan,
        title_sareh: tempEmbedTitleSareh,
        url: tempEmbedUrl,
        url_spanish: tempEmbedSpanish,
        url_afghan: tempEmbedAfghan,
        url_sareh: tempEmbedSareh,
        brief: tempEmbedBrief,
        width: tempEmbedWidth,
        height: tempEmbedHeight,
        borderRadius: tempEmbedBorderRadius,
        playerBorderRadius: tempEmbedPlayerBorderRadius,
        scale: tempEmbedScale,
        framePadding: tempEmbedFramePadding,
        frameColor: tempEmbedFrameColor,
        mystery_icon: tempEmbedMysteryIcon,
        mystery_icon_size: tempEmbedMysteryIconSize
      });
    }
  }, [
    tempEmbedTitle, tempEmbedTitleSpanish, tempEmbedTitleAfghan, tempEmbedTitleSareh,
    tempEmbedUrl, tempEmbedSpanish, tempEmbedAfghan, tempEmbedSareh, tempEmbedBrief,
    tempEmbedWidth, tempEmbedHeight, tempEmbedBorderRadius, tempEmbedPlayerBorderRadius,
    tempEmbedScale, tempEmbedFramePadding, tempEmbedFrameColor, tempEmbedMysteryIcon, tempEmbedMysteryIconSize
  ]);

  const handleSave = async () => {
    if (!unit.embed_urls) return;
    setSaveStatus('saving');
    try {
      const updatedEmbeds = [...unit.embed_urls];
      updatedEmbeds[editingEmbedIdx] = {
        ...(updatedEmbeds[editingEmbedIdx] as any),
        title: tempEmbedTitle,
        title_spanish: tempEmbedTitleSpanish,
        title_afghan: tempEmbedTitleAfghan,
        title_sareh: tempEmbedTitleSareh,
        url: tempEmbedUrl,
        url_spanish: tempEmbedSpanish,
        url_afghan: tempEmbedAfghan,
        url_sareh: tempEmbedSareh,
        brief: tempEmbedBrief,
        width: tempEmbedWidth,
        height: tempEmbedHeight,
        borderRadius: tempEmbedBorderRadius,
        playerBorderRadius: tempEmbedPlayerBorderRadius,
        scale: tempEmbedScale,
        framePadding: tempEmbedFramePadding,
        frameColor: tempEmbedFrameColor,
        mystery_icon: tempEmbedMysteryIcon,
        mystery_icon_size: tempEmbedMysteryIconSize
      };

      const result = await handleUpdateUnitContent({ embed_urls: updatedEmbeds });
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
      console.error('Exception while saving embed content:', err);
      setSaveStatus('error');
      alert('Erro crítico ao salvar: ' + (err.message || 'Erro de conexão/permissão'));
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  return (
    <div className="brief-editor-overlay-v7" style={{ position: 'fixed', top: 0, right: 0, width: '400px', height: '100vh', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 40px rgba(0,0,0,0.1)', borderLeft: '1px solid #e2e8f0' }}>
      <header style={{ padding: '15px 20px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Zap size={20} color="#f59e0b" fill="#f59e0b" />
          <h2 style={{ margin: 0, fontWeight: 900, fontSize: '14px' }}>Ajustes da Atividade ⚡</h2>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleSave} style={{ background: '#10b981', color: 'white', padding: '8px 15px', borderRadius: '10px', border: 'none', fontWeight: 900, cursor: 'pointer', fontSize: '11px' }}>
            {saveStatus === 'saving' ? 'Salvando...' : saveStatus === 'success' ? 'Salvo ✓' : 'Salvar'}
          </button>
          <button onClick={onClose} style={{ background: '#f1f5f9', padding: '8px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h4 style={{ margin: 0, color: '#64748b', fontSize: '11px', fontWeight: 900 }}>1. CONTEÚDO & AJUSTES</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>Título da Atividade</label>
            <input type="text" placeholder="Título padrão..." value={tempEmbedTitle} onChange={(e) => setTempEmbedTitle(e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', width: '100%' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
               <div>
                  <label style={{ fontSize: '9px', fontWeight: 800, color: '#ef4444' }}>TÍTULO ESPANHOL</label>
                  <input type="text" placeholder="Título em espanhol..." value={tempEmbedTitleSpanish} onChange={(e) => setTempEmbedTitleSpanish(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #fee2e2', fontSize: '11px', width: '100%', marginTop: '2px' }} />
               </div>
               <div>
                  <label style={{ fontSize: '9px', fontWeight: 800, color: '#10b981' }}>TÍTULO AFEGÃO</label>
                  <input type="text" placeholder="Título em Dari..." value={tempEmbedTitleAfghan} onChange={(e) => setTempEmbedTitleAfghan(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #d1fae5', fontSize: '11px', width: '100%', marginTop: '2px' }} />
               </div>
               <div>
                  <label style={{ fontSize: '9px', fontWeight: 800, color: '#3b82f6' }}>TÍTULO SAREH</label>
                  <input type="text" placeholder="Título em Sareh..." value={tempEmbedTitleSareh} onChange={(e) => setTempEmbedTitleSareh(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #dbeafe', fontSize: '11px', width: '100%', marginTop: '2px' }} />
               </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minHeight: '200px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>Descrição / Instrução da Atividade</label>
            <RichTextEditor value={tempEmbedBrief} onChange={setTempEmbedBrief} />
          </div>

          <button 
            type="button" 
            onClick={() => setExpandedDesign(!expandedDesign)}
            style={{ 
              width: '100%', 
              padding: '12px 16px', 
              background: '#f8fafc', 
              border: '2px solid #e2e8f0', 
              borderRadius: '14px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              fontWeight: 800, 
              fontSize: '12px',
              color: '#475569',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.2s ease',
              marginTop: '10px'
            }}
          >
            <span>⚙️ Ajustes de Design do Quadro & iFrame</span>
            <span>{expandedDesign ? '▲ Recolher' : '▼ Expandir'}</span>
          </button>

          {expandedDesign && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: '#fafafb', padding: '15px', borderRadius: '14px', border: '1px dashed #cbd5e1', marginTop: '5px' }}>
              <div className="control-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 900, color: '#64748b', marginBottom: '4px' }}><span>LARGURA DO EMBED: {tempEmbedWidth}</span></div>
                <input type="range" min="10" max="100" step="5" value={tempEmbedWidth && tempEmbedWidth.includes('%') ? parseInt(tempEmbedWidth) : 100} style={{ width: '100%', accentColor: '#f59e0b' }} onChange={(e) => setTempEmbedWidth(`${e.target.value}%`)} />
              </div>
              <div className="control-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 900, color: '#64748b', marginBottom: '4px' }}><span>ALTURA DO EMBED: {tempEmbedHeight}px</span></div>
                <input type="range" min="200" max="1200" step="10" value={tempEmbedHeight} style={{ width: '100%', accentColor: '#f59e0b' }} onChange={(e) => setTempEmbedHeight(parseInt(e.target.value))} />
              </div>
              <div className="control-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 900, color: '#64748b', marginBottom: '4px' }}><span>BORDAS DO QUADRO: {tempEmbedBorderRadius}px</span></div>
                <input type="range" min="0" max="100" step="1" value={tempEmbedBorderRadius} style={{ width: '100%', accentColor: '#f59e0b' }} onChange={(e) => setTempEmbedBorderRadius(parseInt(e.target.value))} />
              </div>
              <div className="control-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 900, color: '#64748b', marginBottom: '4px' }}><span>BORDAS DO PLAYER: {tempEmbedPlayerBorderRadius}px</span></div>
                <input type="range" min="0" max="100" step="1" value={tempEmbedPlayerBorderRadius} style={{ width: '100%', accentColor: '#f59e0b' }} onChange={(e) => setTempEmbedPlayerBorderRadius(parseInt(e.target.value))} />
              </div>
              <div className="control-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 900, color: '#64748b', marginBottom: '4px' }}><span>ZOOM DO EMBED: {tempEmbedScale}x</span></div>
                <input type="range" min="0.5" max="2" step="0.05" value={tempEmbedScale} style={{ width: '100%', accentColor: '#f59e0b' }} onChange={(e) => setTempEmbedScale(parseFloat(e.target.value))} />
              </div>
              <div className="control-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 900, color: '#64748b', marginBottom: '4px' }}><span>ESPESSURA DO QUADRO: {tempEmbedFramePadding}</span></div>
                <input type="range" min="0" max="50" step="1" value={parseInt(tempEmbedFramePadding)} style={{ width: '100%', accentColor: '#f59e0b' }} onChange={(e) => setTempEmbedFramePadding(`${e.target.value}px`)} />
              </div>
              <div className="control-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 900, color: '#64748b', marginBottom: '4px' }}><span>COR DO QUADRO:</span></div>
                <select value={tempEmbedFrameColor} style={{ width: '100%', padding: '8px', borderRadius: '8px', fontSize: '12px' }} onChange={(e) => setTempEmbedFrameColor(e.target.value)}>
                  <option value="">Padrão (Bege Escuro)</option>
                  <option value="transparent">Transparente</option>
                  <option value="white">Branco</option>
                  <option value="#f8fafc">Cinza Claro</option>
                  <option value="#3b82f6">Azul</option>
                  <option value="#10b981">Verde</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '9px', fontWeight: 900, color: '#94a3b8' }}>MÁSCARA (ÍCONE)</label>
                  <input type="text" placeholder="Emoji/Ícone..." value={tempEmbedMysteryIcon} onChange={(e) => setTempEmbedMysteryIcon(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '9px', fontWeight: 900, color: '#94a3b8' }}>MÁSCARA (TAMANHO)</label>
                  <input type="number" value={tempEmbedMysteryIconSize} onChange={(e) => setTempEmbedMysteryIconSize(parseInt(e.target.value))} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', paddingRight: '10px' }}>
          <h4 style={{ margin: 0, color: '#64748b', fontSize: '11px', fontWeight: 900 }}>2. LINKS MULTI-IDIOMAS DA ATIVIDADE</h4>
          
          <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '16px', border: '1px solid #cbd5e1' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '10px', fontWeight: 900, color: '#64748b' }}>LINK PADRÃO (GLOBAL)</label>
                <input type="text" placeholder="Link (iFrame ou URL)..." value={tempEmbedUrl} onChange={(e) => setTempEmbedUrl(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '10px', fontWeight: 900, color: '#ef4444' }}>LINK EM ESPANHOL</label>
                <input type="text" placeholder="Link em espanhol opcional..." value={tempEmbedSpanish} onChange={(e) => setTempEmbedSpanish(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #fee2e2', marginTop: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '10px', fontWeight: 900, color: '#10b981' }}>LINK EM DARI (AFEGÃO)</label>
                <input type="text" placeholder="Link em Dari opcional..." value={tempEmbedAfghan} onChange={(e) => setTempEmbedAfghan(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #d1fae5', marginTop: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '10px', fontWeight: 900, color: '#3b82f6' }}>LINK EM SAREH</label>
                <input type="text" placeholder="Link em Sareh opcional..." value={tempEmbedSareh} onChange={(e) => setTempEmbedSareh(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #dbeafe', marginTop: '4px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
