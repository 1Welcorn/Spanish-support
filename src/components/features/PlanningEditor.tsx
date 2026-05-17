import React, { useState, useEffect, useRef, useMemo } from 'react';
import { storage } from '../../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Save, Plus, Trash2, BookOpen, Target, Lightbulb, ChevronLeft, Eye, X, Globe, Lock, Unlock, Bold, Italic, Palette, Eraser, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, Type, Monitor, Image as ImageIcon, Zap, AlertTriangle, Smartphone, Clock, Check, Sparkles, ChefHat, Headphones, User, Building2, GraduationCap, ClipboardList } from 'lucide-react';
import { UnitCard, VideoPlayerV5 } from './Activities';
import { COLORS } from '../../constants/index';

// --- RICH TEXT EDITOR ---
const RichTextEditor: React.FC<{ value: string; onChange: (val: string) => void; height?: string; placeholder?: string }> = ({ value, onChange, height = '350px', placeholder }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => { 
    if (editorRef.current && editorRef.current.innerHTML !== value) { 
      editorRef.current.innerHTML = value || ''; 
    } 
  }, [value]);

  const exec = (cmd: string, val?: string) => { 
    document.execCommand(cmd, false, val); 
    if (editorRef.current) { 
      onChange(editorRef.current.innerHTML); 
    } 
  };

  const btnStyle = { 
    padding: '6px 10px', 
    borderRadius: '8px', 
    border: '1px solid #e2e8f0', 
    background: 'white', 
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 900,
    color: '#64748b',
    transition: 'all 0.2s'
  };

  return (
    <div className="rich-editor-container" style={{ display: 'flex', flexDirection: 'column', height: height, border: '1px solid #e2e8f0', borderRadius: '24px', overflow: 'hidden', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
      <div className="rich-editor-toolbar" style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: '6px', background: '#f8fafc' }}>
        <button onClick={() => exec('formatBlock', '<h1>')} style={btnStyle}>H1</button>
        <button onClick={() => exec('formatBlock', '<h2>')} style={btnStyle}>H2</button>
        <button onClick={() => exec('bold')} style={btnStyle} title="Negrita"><Bold size={14} /></button>
        <button onClick={() => exec('italic')} style={btnStyle} title="Cursiva"><Italic size={14} /></button>
        <div style={{ width: '1px', background: '#e2e8f0', margin: '0 4px' }} />
        <button onClick={() => exec('justifyLeft')} style={btnStyle} title="Alinear a la Izquierda"><AlignLeft size={14} /></button>
        <button onClick={() => exec('justifyCenter')} style={btnStyle} title="Centrar"><AlignCenter size={14} /></button>
        <button onClick={() => exec('justifyRight')} style={btnStyle} title="Alinear a la Derecha"><AlignRight size={14} /></button>
        <button onClick={() => exec('justifyFull')} style={btnStyle} title="Justificar"><AlignJustify size={14} /></button>
        <div style={{ width: '1px', background: '#e2e8f0', margin: '0 4px' }} />
        <button onClick={() => exec('insertUnorderedList')} style={btnStyle} title="Lista"><List size={14} /></button>
        <button onClick={() => exec('foreColor', '#3b82f6')} style={{ ...btnStyle, color: '#3b82f6' }} title="Color Azul"><Palette size={14} /></button>
        <button onClick={() => exec('removeFormat')} style={{ ...btnStyle, color: '#ef4444' }} title="Limpiar Formato"><Eraser size={14} /></button>
      </div>
      <div 
        ref={editorRef} 
        className="rich-editor-content" 
        contentEditable 
        onInput={(e) => onChange(e.currentTarget.innerHTML)} 
        style={{ 
          flex: 1, 
          padding: '20px', 
          background: 'white', 
          outline: 'none', 
          overflowY: 'auto', 
          fontSize: '15px', 
          lineHeight: '1.6',
          color: '#1e293b'
        }} 
      />
    </div>
  );
};

const INTERNAL_ASSETS = [
  { name: 'Ícone Tulipa (Afegã)', path: 'src/assets/tulip icon.png' },
  { name: 'Emblema Hispano', path: 'src/assets/Spanish cartoon emblem.png' },
  { name: 'Emblema Sareh', path: 'src/assets/sareh emblem.png' },
  { name: 'Robot 3D', path: 'src/assets/robot-3d.png' },
  { name: 'Pan 3D', path: 'src/assets/pan-3d.png' },
  { name: 'Memory Game', path: 'src/assets/memory_game.png' },
  { name: 'Word Game', path: 'src/assets/word_game.png' }
];

const AssetPicker: React.FC<{ onSelect: (path: string) => void; onClose: () => void }> = ({ onSelect, onClose }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
    <div style={{ background: 'white', borderRadius: '30px', padding: '30px', maxWidth: '600px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontWeight: 900 }}>Galeria do Repositório</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none' }}><X /></button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '15px' }}>
        {INTERNAL_ASSETS.map(asset => (
          <button key={asset.path} onClick={() => onSelect(`/${asset.path}`)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '15px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
            <img src={`/${asset.path}`} style={{ width: '60px', height: '60px', objectFit: 'contain' }} alt={asset.name} />
            <span style={{ fontSize: '10px', fontWeight: 900, textAlign: 'center' }}>{asset.name}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
);
 
 const StylingControls: React.FC<{ 
   item: any; 
   onChange: (updates: any) => void;
   label?: string;
 }> = ({ item, onChange, label = "CONFIGURAÇÕES DE APARÊNCIA" }) => (
   <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
     <label style={{ fontSize: '11px', fontWeight: 900, color: '#64748b', letterSpacing: '1px' }}>{label || "CONFIGURAÇÕES DE APARÊNCIA"}</label>
     <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
       <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
         
         <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 900 }}><span>LARGURA: {item.width || '100%'}</span></div>
         <input type="range" min="30" max="100" value={parseInt((item.width || '100%').replace(/[^0-9]/g, ''))} style={{ width: '100%' }} onChange={(e) => onChange({ width: `${e.target.value}%` })} />
         
         <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 900 }}><span>ALTURA: {item.height || 600}px</span></div>
         <input type="range" min="300" max="1200" step="10" value={item.height || 600} style={{ width: '100%' }} onChange={(e) => onChange({ height: parseInt(e.target.value) })} />
 
         <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 900 }}><span>BORDAS DO QUADRO: {item.borderRadius !== undefined ? item.borderRadius : 40}px</span></div>
         <input type="range" min="0" max="100" step="1" value={item.borderRadius !== undefined ? item.borderRadius : 40} style={{ width: '100%' }} onChange={(e) => onChange({ borderRadius: parseInt(e.target.value) })} />
 
         <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 900 }}><span>BORDAS DO PLAYER: {item.playerBorderRadius !== undefined ? item.playerBorderRadius : (item.borderRadius !== undefined ? item.borderRadius : 40)}px</span></div>
         <input type="range" min="0" max="100" step="1" value={item.playerBorderRadius !== undefined ? item.playerBorderRadius : (item.borderRadius !== undefined ? item.borderRadius : 40)} style={{ width: '100%' }} onChange={(e) => onChange({ playerBorderRadius: parseInt(e.target.value) })} />
 
         <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 900 }}><span>ZOOM DA IMAGEM/VÍDEO: {item.scale || 1}x</span></div>
         <input type="range" min="0.5" max="3" step="0.1" value={item.scale || 1} style={{ width: '100%' }} onChange={(e) => onChange({ scale: parseFloat(e.target.value) })} />
 
         <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 900 }}><span>ESPESSURA DA MOLDURA: {item.framePadding || '0px'}</span></div>
         <input type="range" min="0" max="60" step="1" value={parseInt(item.framePadding || '0')} style={{ width: '100%' }} onChange={(e) => onChange({ framePadding: `${e.target.value}px` })} />
 
         <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 900 }}><span>COR DA MOLDURA:</span></div>
         <select value={item.frameColor || ''} style={{ fontSize: '11px', width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #e2e8f0' }} onChange={(e) => onChange({ frameColor: e.target.value })}>
           <option value="">Padrão (Branco)</option>
           <option value="transparent">Transparente</option>
           <option value="white">Branco Puro</option>
           <option value="#f8fafc">Cinza Azulado</option>
           <option value="#fef3c7">Beige Pastel</option>
           <option value="#3b82f6">Azul Vibrante</option>
           <option value="#10b981">Verde Dari</option>
           <option value="#000000">Preto Profundo</option>
         </select>
       </div>
     </div>
   </div>
 );
 
 const MiniActivityPreview: React.FC<{ item: any; unitColor: string }> = ({ item, unitColor }) => (
   <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', width: '100%' }}>
     <span style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8' }}>SIMULADOR AO VIVO (VISÃO DO ALUNO)</span>
     <div style={{ 
       width: '100%', 
       background: '#f1f5f9', 
       borderRadius: '25px', 
       padding: '20px', 
       display: 'flex', 
       justifyContent: 'center', 
       minHeight: '250px',
       overflow: 'hidden',
       border: '1px solid #e2e8f0'
     }}>
       <div style={{ 
         width: item.width || '100%', 
         maxWidth: '100%',
         background: item.frameColor || 'white', 
         borderRadius: `${item.borderRadius !== undefined ? item.borderRadius / 2 : 20}px`,
         padding: `${parseInt(item.framePadding || '0') / 2}px 15px 15px`,
         boxShadow: item.frameColor === 'transparent' ? 'none' : '0 10px 30px rgba(0,0,0,0.05)',
         display: 'flex',
         gap: '10px',
         minHeight: item.height ? `${item.height / 2.5}px` : '180px',
         height: 'fit-content'
       }}>
         <div style={{ flex: 1 }}>
           <div style={{ fontSize: '8px', color: unitColor, fontWeight: 900 }}>ATIVIDADE</div>
           <div style={{ fontSize: '10px', fontWeight: 900, marginTop: '2px' }} dangerouslySetInnerHTML={{ __html: item.title || 'Título' }} />
           <div style={{ fontSize: '8px', color: '#64748b', marginTop: '4px' }}>Instruções pedagógicas aparecem aqui...</div>
         </div>
         <div style={{ 
           width: '100px', 
           height: '80px', 
           background: '#f8fafc', 
           borderRadius: `${item.playerBorderRadius !== undefined ? item.playerBorderRadius / 2 : 15}px`,
           border: '1px solid rgba(0,0,0,0.05)',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           overflow: 'hidden',
           transform: `scale(${item.scale || 1})`
         }}>
           <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fff', border: '2px solid #e2e8f0' }} />
         </div>
       </div>
     </div>
   </div>
 );
 
 const MiniQuestionPreview: React.FC<{ item: any; unitColor: string }> = ({ item, unitColor }) => (
   <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', width: '100%' }}>
     <span style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8' }}>SIMULADOR AO VIVO (VISÃO DO ALUNO)</span>
     <div style={{ 
       width: '100%', 
       background: '#f1f5f9', 
       borderRadius: '25px', 
       padding: '20px', 
       display: 'flex', 
       justifyContent: 'center', 
       minHeight: '200px',
       overflow: 'hidden',
       border: '1px solid #e2e8f0'
     }}>
       <div style={{ 
         width: item.width || '100%', 
         maxWidth: '100%',
         background: item.frameColor || 'white', 
         borderRadius: `${item.borderRadius !== undefined ? item.borderRadius / 2 : 20}px`,
         padding: `${parseInt(item.framePadding || '0') / 2}px 20px 20px`,
         boxShadow: item.frameColor === 'transparent' ? 'none' : '0 10px 30px rgba(0,0,0,0.05)',
         display: 'flex',
         flexDirection: 'column',
         gap: '10px',
         minHeight: item.height ? `${item.height / 2.5}px` : '150px',
         height: 'fit-content'
       }}>
         <div style={{ fontSize: '8px', color: '#7c3aed', fontWeight: 900 }}>PERGUNTA 1</div>
         <div style={{ fontSize: '10px', fontWeight: 900 }} dangerouslySetInnerHTML={{ __html: item.q || 'Pergunta?' }} />
         <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {(item.options || ['Opção 1']).map((o: any, idx: number) => (
              <div key={idx} style={{ padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '8px' }}>{o}</div>
            ))}
         </div>
       </div>
     </div>
   </div>
 );

interface PlanningEditorProps {
  unitId: string;
  onBack: () => void;
  updateUnit: (id: string, updates: any) => Promise<{ success: boolean; error?: string }>;
  units: any[];
}

const normalizeEmbedUrl = (rawUrl: string): string => {
  let trimmed = rawUrl.trim();
  if (!trimmed) return '';
  
  // Se for código de iframe completo, extrai apenas o SRC
  if (trimmed.startsWith('<iframe')) {
    const srcMatch = trimmed.match(/src=["'](.*?)["']/);
    if (srcMatch && srcMatch[1]) trimmed = srcMatch[1];
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  
  try {
    const url = new URL(withProtocol);
    
    // WORDWALL: Converte /resource/ para /embed/resource/
    if (url.hostname.includes('wordwall.net')) {
      if (url.pathname.includes('/resource/') && !url.pathname.includes('/embed/')) {
        url.pathname = url.pathname.replace('/resource/', '/embed/resource/');
      }
      return url.toString();
    }

    // YOUTUBE
    if (url.hostname.includes('youtube.com') && url.pathname === '/watch') {
      const videoId = url.searchParams.get('v');
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.hostname.includes('youtu.be')) {
      const videoId = url.pathname.replace('/', '');
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    // CANVA: Tenta converter links de visualização para embed
    if (url.hostname.includes('canva.com') && url.pathname.includes('/view')) {
      url.pathname = url.pathname.replace('/view', '/view?embed');
      return url.toString();
    }

    // GOOGLE DRIVE
    if (url.hostname.includes('drive.google.com')) {
      url.pathname = url.pathname.replace(/\/view$/, '/preview');
      return url.toString();
    }

    return url.toString();
  } catch {
    return trimmed;
  }
};

const PlanningEditor: React.FC<PlanningEditorProps> = ({ unitId, onBack, updateUnit, units }) => {
  const [activeTab, setActiveTab] = useState('identity');
  const [loading, setLoading] = useState(false);
  const unitDataFromProps = useMemo(() => units.find(u => u.id === unitId), [units, unitId]);
  
  const [unitData, setUnitData] = useState<any>(null);
  const [newWord, setNewWord] = useState("");
  const [descText, setDescText] = useState("");
  const [tempEmbed, setTempEmbed] = useState("");
  const [isSavingEmbed, setIsSavingEmbed] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [autoSavePulse, setAutoSavePulse] = useState(false);
  const [showAssetPicker, setShowAssetPicker] = useState<{ active: boolean; callback: (path: string) => void }>({ active: false, callback: () => {} });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadCallback, setActiveUploadCallback] = useState<(url: string) => void>(() => () => {});

  const triggerUpload = (callback: (url: string) => void) => {
    setActiveUploadCallback(() => callback);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, file);
      const publicUrl = await getDownloadURL(storageRef);

      activeUploadCallback(publicUrl);
      setIsDirty(true);
    } catch (err: any) {
      console.error('Upload error:', err);
      alert('Erro no upload. Verifique se o Storage está configurado no Firebase.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Sincroniza o estado local quando os dados globais mudam
  useEffect(() => {
    if (unitDataFromProps) {
      if (!unitData || !isDirty) {
        setUnitData(JSON.parse(JSON.stringify(unitDataFromProps)));
        setDescText(unitDataFromProps.descriptors?.join(', ') || '');
      }
    }
  }, [unitDataFromProps, isDirty]);

  const handleSave = async (overrideData?: any) => {
    const dataToSave = overrideData || unitData;
    if (!dataToSave) return;
    try {
      const descs = descText.split(',').map((v: string) => v.trim()).filter(Boolean);
      // Remove ID from updates to avoid Supabase conflicts
      const { id, ...updatesOnly } = dataToSave;
      const finalUpdates = JSON.parse(JSON.stringify({ ...updatesOnly, descriptors: descs }));
      
      const result = await updateUnit(unitId, finalUpdates);
      if (result.success) {
        setIsDirty(false);
        setAutoSavePulse(true);
        setTimeout(() => setAutoSavePulse(false), 2000);
      } else {
         alert('Erro ao salvar: ' + result.error);
      }
    } catch (err: any) { alert('Erro crítico ao salvar: ' + err.message); }
  };

  const addWord = () => {
    if (!newWord.trim()) return;
    const parts = newWord.split('/').map(p => p.trim());
    const wordObj = { en: parts[0], pt: parts[1] || parts[0], dari: parts[2] || undefined, icon: '🏷️' };
    const nextData = { ...unitData, vocabulary_list: [...(unitData.vocabulary_list || []), wordObj] };
    setUnitData(nextData);
    setNewWord("");
    setIsDirty(true);
  };

  const saveEmbedLink = async () => {
    if (!tempEmbed.trim() || isSavingEmbed) return;
    setIsSavingEmbed(true);
    const normalized = normalizeEmbedUrl(tempEmbed);
    const nextEmbeds = [...(unitData.embed_urls || []), { url: normalized, title: `Atividade`, width: '100%' }];
    const nextData = { ...unitData, embed_urls: nextEmbeds };
    
    // Atualiza localmente e tenta salvar no banco imediatamente
    setUnitData(nextData);
    setTempEmbed("");
    setIsSavingEmbed(false);
    setIsDirty(true);
    
    // Auto-save para evitar perda de links
    handleSave(nextData);
  };

  if (loading) return <div className="screen-loading"><div className="loader-spinner"></div><p>Carregando...</p></div>;
  if (!unitData) return <div className="screen-error"><h2>Sincronizando...</h2></div>;

  return (
    <div className="planning-editor-view" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '150px' }}>
      
      {/* HEADER FIXO */}
      <header className="editor-header" style={{ background: 'white', padding: '15px 30px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={onBack} style={{ background: '#f1f5f9', border: 'none', padding: '10px', borderRadius: '14px' }}><ChevronLeft size={24} /></button>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 900, margin: 0 }}>Administrador do Mediador</h1>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Aula: {unitData.title}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {autoSavePulse && <span style={{ color: '#10b981', fontSize: '11px', fontWeight: 900, animation: 'pulse 1s infinite' }}>SALVO COM SUCESSO ✓</span>}
          <button onClick={() => handleSave()} style={{ background: isDirty ? '#f59e0b' : '#10b981', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '14px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
            <Save size={18} /> {isDirty ? 'SALVAR TUDO AGORA' : 'SISTEMA ATUALIZADO'}
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '0', minHeight: 'calc(100vh - 80px)' }}>
        
        {/* SIDEBAR DE NAVEGAÇÃO TABS */}
        <aside style={{ 
          width: '280px', 
          background: 'white', 
          borderRight: '1px solid #e2e8f0', 
          padding: '30px 20px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '10px',
          position: 'sticky',
          top: '80px',
          height: 'calc(100vh - 80px)'
        }}>
          {[
            { id: 'identity', label: 'Identidade', icon: <Type size={18} />, color: '#6366f1' },
            { id: 'guide', label: 'Guia & Mídia', icon: <BookOpen size={18} />, color: '#3b82f6' },
            { id: 'activities', label: 'Atividades', icon: <Globe size={18} />, color: '#10b981' },
            { id: 'vocab', label: 'Vocabulário', icon: <AlignLeft size={18} />, color: '#0ea5e9' },
            { id: 'questions', label: 'Perguntas', icon: <Zap size={18} />, color: '#8b5cf6' },
            { id: 'visual', label: 'Visual & Metas', icon: <Sparkles size={18} />, color: '#f59e0b' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 18px',
                borderRadius: '16px',
                border: 'none',
                background: activeTab === tab.id ? `${tab.color}15` : 'transparent',
                color: activeTab === tab.id ? tab.color : '#64748b',
                cursor: 'pointer',
                fontWeight: 900,
                fontSize: '14px',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
            >
              <div style={{ 
                background: activeTab === tab.id ? tab.color : '#f1f5f9', 
                color: activeTab === tab.id ? 'white' : '#64748b',
                padding: '8px',
                borderRadius: '10px',
                display: 'flex'
              }}>
                {tab.icon}
              </div>
              {tab.label}
            </button>
          ))}
        </aside>

        <div style={{ flex: 1, padding: '40px', maxWidth: '1100px', margin: '0 auto' }}>
          
          {/* TAB: IDENTIDADE */}
          {activeTab === 'identity' && (
            <section style={{ animation: 'fadeIn 0.3s ease-out' }}>
              <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#1e293b', margin: '0 0 8px 0' }}>Identidade da Unidade</h2>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Defina como a aula será apresentada para cada comunidade.</p>
              </div>
              
              <div style={{ background: 'white', borderRadius: '30px', padding: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
                     <div>
                       <label style={{ fontSize: '11px', fontWeight: 900, color: '#64748b', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>TÍTULO PRINCIPAL (PORTUGUÊS / BASE)</label>
                       <RichTextEditor height="120px" value={unitData.title || ''} onChange={(val) => { setUnitData({...unitData, title: val}); setIsDirty(true); }} />
                     </div>
                     
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: 900, color: '#059669', display: 'block', marginBottom: '8px' }}>TÍTULO (AFEGHÃO - DARI)</label>
                          <input 
                            type="text" 
                            value={unitData.title_dari || ''} 
                            onChange={(e) => { setUnitData({...unitData, title_dari: e.target.value}); setIsDirty(true); }} 
                            style={{ width: '100%', padding: '15px', borderRadius: '15px', border: '1.5px solid #059669', fontSize: '16px', fontWeight: 700 }} 
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: 900, color: '#ef4444', display: 'block', marginBottom: '8px' }}>TÍTULO (COMUNIDADE HISPANA)</label>
                          <input 
                            type="text" 
                            value={unitData.title_spanish || ''} 
                            onChange={(e) => { setUnitData({...unitData, title_spanish: e.target.value}); setIsDirty(true); }} 
                            style={{ width: '100%', padding: '15px', borderRadius: '15px', border: '1.5px solid #ef4444', fontSize: '16px', fontWeight: 700 }} 
                          />
                        </div>
                     </div>

                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: 900, color: '#3b82f6', display: 'block', marginBottom: '8px' }}>TÍTULO (SAREH / AIONE)</label>
                          <input 
                            type="text" 
                            value={unitData.title_sareh || ''} 
                            onChange={(e) => { setUnitData({...unitData, title_sareh: e.target.value}); setIsDirty(true); }} 
                            style={{ width: '100%', padding: '15px', borderRadius: '15px', border: '1.5px solid #3b82f6', fontSize: '16px', fontWeight: 700 }} 
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: 900, color: '#64748b', display: 'block', marginBottom: '8px' }}>SUBTÍTULO (GERAL)</label>
                          <input 
                            type="text" 
                            value={unitData.sub || ''} 
                            onChange={(e) => { setUnitData({...unitData, sub: e.target.value}); setIsDirty(true); }} 
                            placeholder="Ex: Aula 1"
                            style={{ width: '100%', padding: '15px', borderRadius: '15px', border: '1.5px solid #e2e8f0', fontSize: '16px' }} 
                          />
                        </div>
                     </div>
                 </div>
              </div>
            </section>
          )}

          {/* TAB: GUIA & MÍDIA */}
          {activeTab === 'guide' && (
            <section style={{ animation: 'fadeIn 0.3s ease-out' }}>
               <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#3b82f6', margin: '0 0 8px 0' }}>Guia de Estudo e Mídias</h2>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Instruções para o mediador e vídeos/imagens de introdução.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div style={{ background: 'white', borderRadius: '30px', padding: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                   <label style={{ fontSize: '11px', fontWeight: 900, color: '#64748b', display: 'block', marginBottom: '15px' }}>TEXTO DE ORIENTAÇÃO PEDAGÓGICA</label>
                   <RichTextEditor value={unitData.brief || ""} onChange={(val) => { setUnitData({...unitData, brief: val}); setIsDirty(true); }} />
                </div>

                <div style={{ background: 'white', borderRadius: '30px', padding: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900 }}>Mídias do Mediador</h3>
                      <button onClick={() => { setUnitData({...unitData, external_links: [...(unitData.external_links || []), { label: 'video', url: '', width: '600px', height: 300, objectFit: 'cover' }]}); setIsDirty(true); }} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 900, fontSize: '12px' }}>+ ADICIONAR VÍDEO/IMAGEM</button>
                   </div>
                   
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                      {(unitData.external_links || []).map((link: any, i: number) => (
                        <div key={i} style={{ background: '#f8fafc', padding: '20px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                           {/* ... conteúdo do link igual ao anterior ... */}
                           <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                              <input type="text" value={link.url} placeholder="URL do Vídeo..." style={{ flex: 1, padding: '12px', borderRadius: '12px' }} onChange={(e) => { const nl = [...unitData.external_links]; nl[i].url = e.target.value; setUnitData({...unitData, external_links: nl}); setIsDirty(true); }} />
                              <button onClick={() => { const nl = unitData.external_links.filter((_: any, idx: number) => idx !== i); setUnitData({...unitData, external_links: nl}); setIsDirty(true); }} style={{ color: '#ef4444', background: '#fee2e2', border: 'none', borderRadius: '12px', padding: '0 15px' }}><Trash2 size={18} /></button>
                           </div>
                           <StylingControls item={link} onChange={(upd) => { const nl = [...unitData.external_links]; nl[i] = {...nl[i], ...upd}; setUnitData({...unitData, external_links: nl}); setIsDirty(true); }} />
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </section>
          )}

          {/* TAB: ATIVIDADES */}
          {activeTab === 'activities' && (
            <section style={{ animation: 'fadeIn 0.3s ease-out' }}>
               <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#10b981', margin: '0 0 8px 0' }}>Atividades Interativas</h2>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Links do Wordwall, Canva e configurações de atividades de mistério.</p>
              </div>

               <div style={{ display: 'flex', gap: '12px', marginBottom: '30px', background: 'white', padding: '30px', borderRadius: '30px', border: '2px dashed #10b981' }}>
                  <div style={{ flex: 1 }}>
                     <label style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', marginBottom: '5px', display: 'block' }}>COLE O LINK AQUI</label>
                     <input type="text" placeholder="https://wordwall.net/resource/..." value={tempEmbed} onChange={(e) => setTempEmbed(e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '15px', border: '1px solid #e2e8f0' }} />
                  </div>
                  <button onClick={saveEmbedLink} disabled={isSavingEmbed} style={{ alignSelf: 'flex-end', background: '#10b981', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '15px', fontWeight: 900 }}>ADICIONAR</button>
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                  {unitData.embed_urls?.map((item: any, i: number) => (
                    <div key={i} style={{ background: 'white', borderRadius: '30px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                       <div style={{ background: '#f8fafc', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 900, fontSize: '13px' }}>Atividade {i + 1}</span>
                          <button onClick={() => { const nl = unitData.embed_urls.filter((_: any, idx: number) => idx !== i); setUnitData({...unitData, embed_urls: nl}); setIsDirty(true); }} style={{ background: 'none', border: 'none', color: '#ef4444' }}><Trash2 size={18} /></button>
                       </div>
                       <div style={{ padding: '25px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                             <label style={{ fontSize: '10px', fontWeight: 900 }}>TÍTULO DA ATIVIDADE</label>
                             <input type="text" value={item.title || ''} onChange={(e) => { const nl = [...unitData.embed_urls]; nl[i].title = e.target.value; setUnitData({...unitData, embed_urls: nl}); setIsDirty(true); }} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                             <label style={{ fontSize: '10px', fontWeight: 900 }}>DICAS PARA O ALUNO</label>
                             <RichTextEditor height="150px" value={item.brief || ''} onChange={(val) => { const nl = [...unitData.embed_urls]; nl[i].brief = val; setUnitData({...unitData, embed_urls: nl}); setIsDirty(true); }} />
                          </div>
                          <StylingControls item={item} onChange={(upd) => { const nl = [...unitData.embed_urls]; nl[i] = {...nl[i], ...upd}; setUnitData({...unitData, embed_urls: nl}); setIsDirty(true); }} />
                       </div>
                    </div>
                  ))}
               </div>
            </section>
          )}

          {/* TAB: VOCABULÁRIO */}
          {activeTab === 'vocab' && (
            <section style={{ animation: 'fadeIn 0.3s ease-out' }}>
               <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0ea5e9', margin: '0 0 8px 0' }}>Banco de Palavras</h2>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Palavras que caem no jogo WordFall.</p>
              </div>

               <div style={{ background: 'white', borderRadius: '30px', padding: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                     <input value={newWord} onChange={(e) => setNewWord(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addWord()} placeholder="Ex: Fridge / Geladeira" style={{ flex: 1, padding: '15px', borderRadius: '15px', border: '1.5px solid #cbd5e1' }} />
                     <button onClick={addWord} style={{ background: '#0ea5e9', color: 'white', border: 'none', padding: '0 25px', borderRadius: '15px', fontWeight: 900 }}>ADICIONAR</button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                     {unitData.vocabulary_list?.map((w: any, i: number) => (
                       <span key={i} style={{ background: '#f1f5f9', padding: '10px 18px', borderRadius: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '14px' }}>{typeof w === 'object' ? w.en : w}</span>
                          <button onClick={() => { const nv = unitData.vocabulary_list.filter((_: any, idx: number) => idx !== i); setUnitData({...unitData, vocabulary_list: nv}); setIsDirty(true); }} style={{ background: 'none', border: 'none', color: '#ef4444', padding: 0 }}><Trash2 size={14} /></button>
                       </span>
                     ))}
                  </div>
               </div>
            </section>
          )}

          {/* TAB: PERGUNTAS */}
          {activeTab === 'questions' && (
            <section style={{ animation: 'fadeIn 0.3s ease-out' }}>
               <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#8b5cf6', margin: '0 0 8px 0' }}>Perguntas Interativas</h2>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Crie perguntas de múltipla escolha para validar o aprendizado.</p>
              </div>

               <button onClick={() => { setUnitData({...unitData, questions: [...(unitData.questions || []), { q: 'Nova Pergunta', type: 'mc', options: ['Opção 1'], correct: 'Opção 1' }]}); setIsDirty(true); }} style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '15px', fontWeight: 900, marginBottom: '25px' }}>+ CRIAR NOVA PERGUNTA</button>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {unitData.questions?.map((q: any, i: number) => (
                    <div key={i} style={{ background: 'white', padding: '30px', borderRadius: '30px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                          <div style={{ flex: 1 }}>
                             <label style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', display: 'block', marginBottom: '8px' }}>TEXTO DA PERGUNTA</label>
                             <RichTextEditor height="150px" value={q.q} onChange={(val) => { const nq = [...unitData.questions]; nq[i].q = val; setUnitData({...unitData, questions: nq}); setIsDirty(true); }} />
                          </div>
                          <button onClick={() => { const nq = unitData.questions.filter((_: any, idx: number) => idx !== i); setUnitData({...unitData, questions: nq}); setIsDirty(true); }} style={{ background: 'none', border: 'none', padding: '10px' }}><Trash2 color="#ef4444" /></button>
                       </div>
                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                          <div>
                             <label style={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', display: 'block', marginBottom: '10px' }}>OPÇÕES</label>
                             {q.options?.map((opt: string, oIdx: number) => (
                               <div key={oIdx} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                                  <input type="text" value={opt} onChange={(e) => { const nq = [...unitData.questions]; nq[i].options[oIdx] = e.target.value; setUnitData({...unitData, questions: nq}); setIsDirty(true); }} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                                  <button onClick={() => { const nq = [...unitData.questions]; nq[i].options = nq[i].options.filter((_: any, x: number) => x !== oIdx); setUnitData({...unitData, questions: nq}); setIsDirty(true); }} style={{ background: 'none', border: 'none' }}><X size={16} /></button>
                               </div>
                             ))}
                             <button onClick={() => { const nq = [...unitData.questions]; nq[i].options = [...(nq[i].options || []), 'Nova Opção']; setUnitData({...unitData, questions: nq}); setIsDirty(true); }} style={{ color: '#8b5cf6', background: 'none', border: 'none', fontWeight: 900, fontSize: '12px' }}>+ Adicionar Opção</button>
                          </div>
                          <StylingControls item={q} onChange={(upd) => { const nq = [...unitData.questions]; nq[i] = {...nq[i], ...upd}; setUnitData({...unitData, questions: nq}); setIsDirty(true); }} />
                       </div>
                    </div>
                  ))}
               </div>
            </section>
          )}

          {/* TAB: VISUAL & METAS */}
          {activeTab === 'visual' && (
            <section style={{ animation: 'fadeIn 0.3s ease-out' }}>
               <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#f59e0b', margin: '0 0 8px 0' }}>Visual e Metas</h2>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Descritores pedagógicos e personalização visual dos ícones.</p>
              </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  <div style={{ background: 'white', borderRadius: '30px', padding: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                     <h3 style={{ margin: 0, fontWeight: 900, fontSize: '16px', marginBottom: '15px' }}>Descritores (BNCC)</h3>
                     <input value={descText} onChange={(e) => { setDescText(e.target.value); setIsDirty(true); }} placeholder="D3, D5, EF06LI01..." style={{ width: '100%', padding: '15px', borderRadius: '15px', border: '1px solid #e2e8f0', fontSize: '15px' }} />
                  </div>

                  <div style={{ background: 'white', borderRadius: '30px', padding: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                     <h3 style={{ margin: 0, fontWeight: 900, fontSize: '16px', marginBottom: '15px' }}>Personalização do Ícone</h3>
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '12px' }}>
                        {[
                          { id: 'chef', icon: <ChefHat /> },
                          { id: 'headphones', icon: <Headphones /> },
                          { id: 'user', icon: <User /> },
                          { id: 'building', icon: <Building2 /> },
                          { id: 'book', icon: <BookOpen /> },
                          { id: 'mobile', icon: <Smartphone /> },
                          { id: 'school', icon: <GraduationCap /> },
                          { id: 'clipboard', icon: <ClipboardList /> },
                          { id: 'image', icon: <ImageIcon /> },
                          { id: 'zap', icon: <Zap /> }
                        ].map(item => (
                          <button key={item.id} onClick={() => { setUnitData({...unitData, icon: item.id}); setIsDirty(true); }} style={{ padding: '15px', borderRadius: '16px', background: unitData.icon === item.id ? '#f59e0b' : '#f8fafc', color: unitData.icon === item.id ? 'white' : '#64748b', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center' }}>{React.cloneElement(item.icon as any, { size: 24 })}</button>
                        ))}
                     </div>
                  </div>

                  <div style={{ background: 'white', borderRadius: '30px', padding: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                     <h3 style={{ margin: 0, fontWeight: 900, fontSize: '16px', marginBottom: '15px' }}>Máscara de Mistério (Opcional)</h3>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                           <input 
                              type="text" 
                              value={unitData.mystery_icon || ""} 
                              onChange={(e) => { setUnitData({...unitData, mystery_icon: e.target.value}); setIsDirty(true); }}
                              placeholder="URL da Imagem da Máscara..."
                              style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1' }}
                           />
                           <button onClick={() => triggerUpload((url) => { setUnitData({...unitData, mystery_icon: url}); setIsDirty(true); })} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0 15px', borderRadius: '12px' }}><ImageIcon size={18} /></button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                           <span style={{ fontSize: '11px', fontWeight: 900 }}>TAMANHO: {unitData.mystery_icon_size || 120}px</span>
                           <input type="range" min="40" max="300" value={unitData.mystery_icon_size || 120} onChange={(e) => { setUnitData({...unitData, mystery_icon_size: parseInt(e.target.value)}); setIsDirty(true); }} style={{ flex: 1 }} />
                        </div>
                     </div>
                  </div>
               </div>
            </section>
          )}

        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {showAssetPicker.active && <AssetPicker onSelect={showAssetPicker.callback} onClose={() => setShowAssetPicker({ active: false, callback: () => {} })} />}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />

      </div>

      {showAssetPicker.active && <AssetPicker onSelect={showAssetPicker.callback} onClose={() => setShowAssetPicker({ active: false, callback: () => {} })} />}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
      
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 0.6; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default PlanningEditor;
