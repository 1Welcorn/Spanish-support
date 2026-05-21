import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Unit, Question, ExternalLink, QuestionType } from '../../types';
import { COLORS } from '../../constants/index';
import {
  Sparkles, Plus, FileText, ChevronDown,
  Trash2, Info, Edit2,
  ChefHat, Headphones, User, Building2, Smartphone, BookOpen, GraduationCap,
  Maximize, ChevronRight, ChevronLeft, ArrowLeft,
  Eye, Lock, Unlock, X, ClipboardList, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Type, Eraser, Palette, Maximize2, Clock, Monitor, Smartphone as MobileIcon, Image as ImageIcon, AlertTriangle, Zap
} from 'lucide-react';
import memoryGameImg from '../../assets/memory_game.webp';
import wordGameImg from '../../assets/word_game.webp';
import { HomeButton } from '../ui/HomeButton';
import { QuestionBlock } from './QuestionBlock';
import EmbedPreview from '../ui/EmbedPreview';
import { useAuth } from '../../context/AuthContext';
import { useStudentJourney } from '../../hooks/useStudentJourney';
import WordFallGame from './WordFallGame';
import { BriefEditor } from './editors/BriefEditor';
import { EmbedEditor } from './editors/EmbedEditor';
import { QuestionEditor } from './editors/QuestionEditor';

// --- RICH TEXT EDITOR ---
export const RichTextEditor: React.FC<{ value: string; onChange: (val: string) => void }> = ({ value, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (editorRef.current && editorRef.current.innerHTML !== value) { editorRef.current.innerHTML = value; } }, []);
  const exec = (cmd: string, val?: string) => { document.execCommand(cmd, false, val); if (editorRef.current) { onChange(editorRef.current.innerHTML); } };
  return (
    <div className="rich-editor-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
      <div className="rich-editor-toolbar" style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: '4px', background: '#fff' }}>
        <button onClick={() => exec('formatBlock', '<h1>')}>H1</button>
        <button onClick={() => exec('formatBlock', '<h2>')}>H2</button>
        <button onClick={() => exec('bold')}><Bold size={14} /></button>
        <button onClick={() => exec('italic')}><Italic size={14} /></button>
        <button onClick={() => exec('justifyLeft')}><AlignLeft size={14} /></button>
        <button onClick={() => exec('justifyCenter')}><AlignCenter size={14} /></button>
        <button onClick={() => exec('justifyRight')}><AlignRight size={14} /></button>
        <button onClick={() => exec('justifyFull')}><AlignJustify size={14} /></button>
        <button onClick={() => exec('insertUnorderedList')}><List size={14} /></button>
        <button onClick={() => exec('foreColor', '#3b82f6')} style={{ color: '#3b82f6' }}><Palette size={14} /></button>
        <button onClick={() => exec('removeFormat')}><Eraser size={14} /></button>
      </div>
      <div ref={editorRef} className="rich-editor-content" contentEditable onInput={(e) => onChange(e.currentTarget.innerHTML)} style={{ flex: 1, padding: '20px', background: 'white', outline: 'none', overflowY: 'auto', fontSize: '15px' }} />
    </div>
  );
};

// --- UNIVERSAL MEDIA PLAYER (V10) ---
export const VideoPlayerV5: React.FC<{ media: ExternalLink }> = ({ media }) => {
  // Escolha dinâmica da URL baseada no projectMode (fallback para 'spanish' se null/undefined)
  const { projectMode: rawProjectMode } = useAuth();
  const projectMode = rawProjectMode || 'spanish';
  let actualUrl = media.url || '';
  if (projectMode === 'afghan' && media.url_afghan) actualUrl = media.url_afghan;
  else if (projectMode === 'spanish' && media.url_spanish) actualUrl = media.url_spanish;
  else if (projectMode === 'sareh' && media.url_sareh) actualUrl = media.url_sareh;

  if (typeof actualUrl !== 'string') {
    actualUrl = '';
  }

  if (actualUrl && actualUrl.includes('player.cloudinary.com/embed')) {
    try {
      const urlObj = new URL(actualUrl);
      const publicId = urlObj.searchParams.get('public_id');
      const cloudName = urlObj.searchParams.get('cloud_name');
      if (publicId && cloudName) {
        actualUrl = `https://res.cloudinary.com/${cloudName}/video/upload/${publicId}.mp4`;
      }
    } catch (e) {
      // Falha silenciosa, usa a URL original
    }
  }

  // Considera iframe se for youtube, vimeo ou Cloudinary embed player
  const isIframeEmbed = !!(actualUrl && (actualUrl.includes('youtube.com/embed') || actualUrl.includes('vimeo.com') || actualUrl.includes('player.cloudinary.com/embed')));
  const isImage = !!(media.label === 'media' || (actualUrl && actualUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i)));

  // URL instantânea para evitar sensação de "quebrado"
  const getBaseSrc = (url: string) => {
    if (!url) return '';
    try {
      const parsed = new URL(url);
      parsed.searchParams.set('autoplay', '0');
      parsed.searchParams.set('controls', '0');
      parsed.searchParams.set('rel', '0');
      return parsed.toString();
    } catch {
      const sep = url.includes('?') ? '&' : '?';
      return `${url}${sep}autoplay=0&controls=0&rel=0`;
    }
  };

  const [iframeSrc, setIframeSrc] = useState(isIframeEmbed ? getBaseSrc(actualUrl) : actualUrl);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Atualiza instantaneamente se a URL mudar
  useEffect(() => {
    if (isIframeEmbed) {
      setIframeSrc(getBaseSrc(actualUrl));
    }
  }, [actualUrl, isIframeEmbed]);

  useEffect(() => {
    if (isImage || !actualUrl) return;

    // Reseta o estado do vídeo quando o delay muda para poder visualizar o efeito
    if (isIframeEmbed) {
      setIframeSrc(getBaseSrc(actualUrl));
    } else if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }

    const delayTime = media.delay !== undefined ? media.delay * 1000 : 500;
    const timer = setTimeout(() => {
      if (isIframeEmbed) {
        try {
          const parsed = new URL(actualUrl);
          parsed.searchParams.set('autoplay', '1');
          parsed.searchParams.set('controls', '0');
          parsed.searchParams.set('rel', '0');
          setIframeSrc(parsed.toString());
        } catch {
          const sep = actualUrl.includes('?') ? '&' : '?';
          setIframeSrc(`${actualUrl}${sep}autoplay=1&controls=0&rel=0`);
        }
      } else if (videoRef.current) {
        videoRef.current.play().catch(() => {
          if (videoRef.current) { videoRef.current.muted = true; videoRef.current.play(); }
        });
      }
    }, delayTime);
    return () => clearTimeout(timer);
  }, [actualUrl, media.delay, isImage, isIframeEmbed]);

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };
    const objectFit = (media.objectFit as string) || 'cover';
  const br = media.borderRadius !== undefined ? `${media.borderRadius}px` : '20px';
  const playerBr = media.playerBorderRadius !== undefined ? `${media.playerBorderRadius}px` : br;

  // Para imagens, usamos clip-path em vez de overflow:hidden no container
  // porque clip-path clippa a própria imagem independente do tamanho do container.
  // Isso funciona com PNGs transparentes, objectFit:contain, etc.
  const imageClipPath = `inset(0 round ${playerBr})`;
  const transition = 'clip-path 0.2s ease, border-radius 0.2s ease, object-fit 0.2s ease';

  // Em modo 'contain', a imagem é menor que o container — o container não deve
  // receber overflow:hidden nem borderRadius, pois o arredondamento já vem do
  // clip-path aplicado diretamente na imagem. Em 'cover'/'fill' o container
  // preenche e pode clipar normalmente.
  const isContain = isImage && objectFit === 'contain';

  const containerStyle: React.CSSProperties = {
    width: media.width || '100%',
    height: media.height ? `${media.height}px` : 'auto',
    // Contain: sem borderRadius no container (a imagem já tem clip-path)
    // Cover/fill: container arredonda e clippa
    borderRadius: isContain ? '0px' : br,
    overflow: isContain ? 'visible' : 'hidden',
    background: media.frameColor === 'transparent' ? 'transparent' : (media.frameColor || (isImage ? 'transparent' : '#000')),
    padding: media.framePadding || '0px',
    boxSizing: 'border-box',
    margin: '10px auto',
    boxShadow: isImage ? 'none' : '0 15px 45px rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexShrink: 0,
    transition: 'border-radius 0.2s ease, overflow 0.2s ease',
  };

  // Estilo base para iframe/video
  const mediaStyle: React.CSSProperties = {
    width: '100%',
    height: media.height ? '100%' : (isImage ? 'auto' : '100%'),
    objectFit: objectFit as any,
    border: 'none',
    display: 'block',
    cursor: !isImage && !isIframeEmbed ? 'pointer' : 'default',
    borderRadius: playerBr,
    transform: media.scale !== undefined ? `scale(${media.scale})` : (objectFit === 'cover' && isIframeEmbed ? 'scale(1.2)' : 'none')
  };

  // Estilo específico para imagens — clip-path garante arredondamento em qualquer situação
  // Em contain: a imagem usa seu tamanho natural; clip-path arredonda a própria imagem
  // Em cover/fill: a imagem preenche o container; o container já cuida do arredondamento
  const imageStyle: React.CSSProperties = {
    width: objectFit === 'contain' ? 'auto' : '100%',
    height: media.height ? '100%' : 'auto',
    maxWidth: '100%',
    maxHeight: media.height ? '100%' : '80vh',
    objectFit: objectFit as any,
    border: 'none',
    display: 'block',
    // clip-path arredonda a própria imagem — essencial no modo contain onde
    // a imagem é menor que o container e overflow:hidden não funcionaria.
    // Em cover/fill também aplica para consistência (o container já clippa de qualquer forma).
    clipPath: imageClipPath,
    borderRadius: playerBr, // fallback para browsers que não suportam clip-path
    transition,
    transform: media.scale !== undefined ? `scale(${media.scale})` : 'none',
  };

  return (
    <div style={containerStyle} className="media-renderer-v10">
      {isImage ? (
        <img src={actualUrl} style={imageStyle} alt="Content" />
      ) : isIframeEmbed ? (
        <iframe src={iframeSrc} style={mediaStyle} allow="autoplay; fullscreen" />
      ) : (
        <video ref={videoRef} src={actualUrl} onClick={handleVideoClick} style={mediaStyle} playsInline preload="auto" />
      )}
    </div>
  );
};

// --- STEP NAVIGATION ---
const StepNavigation: React.FC<{
  unit: Unit;
  answers: Record<string, any>;
  onSaveAnswer: (qIdx: number, val: string) => Promise<boolean>;
  isAdmin?: boolean;
  isMediator?: boolean;
  editQuestion: (idx: number, newQ: Question) => void;
  deleteQuestion: (idx: number) => void;
  currentColors: any;
  onStartGame?: () => void;
  handleUpdateUnitContent: (updates: Partial<Unit>) => Promise<{ success: boolean; error?: string }>;
  onSaveSession: (note: string) => Promise<boolean>;
  onToggle?: () => void;
  completeLesson: (uId: string, xp: number) => Promise<any>;
  isFirstUnit?: boolean;
  onGoHome?: () => void;
}> = ({ unit, answers, onSaveAnswer, isAdmin, isMediator, editQuestion, deleteQuestion, currentColors, onStartGame, handleUpdateUnitContent, onSaveSession, onToggle, completeLesson, isFirstUnit, onGoHome }) => {
  const { projectMode: rawProjectMode } = useAuth();
  const projectMode = rawProjectMode || 'spanish';
  const [activeStep, setActiveStep] = useState(0);
  const [isEditingBrief, setIsEditingBrief] = useState(false);
  const [editingEmbedIdx, setEditingEmbedIdx] = useState<number | null>(null);
  const [liveEmbedOverride, setLiveEmbedOverride] = useState<any>(null);
  const [editingQuestionIdx, setEditingQuestionIdx] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSaving, setDrawerSaving] = useState(false);
  const [drawerSaved, setDrawerSaved] = useState(false);
  // Estado local dos controles do drawer — sincronizado com o step ativo
  const [dUrl, setDUrl] = useState('');
  const [dUrlSpanish, setDUrlSpanish] = useState('');
  const [dUrlAfghan, setDUrlAfghan] = useState('');
  const [dUrlSareh, setDUrlSareh] = useState('');
  const [dHeight, setDHeight] = useState(600);
  const [dScale, setDScale] = useState(1);
  const [dBorderRadius, setDBorderRadius] = useState(40);
  const [dFrameColor, setDFrameColor] = useState('');
  const [dTitle, setDTitle] = useState('');
  const [dQText, setDQText] = useState('');
  const [dQOptions, setDQOptions] = useState<string[]>([]);
  // Controles da imagem do Guia de Estudo (brief)
  const [dMediaIdx, setDMediaIdx] = useState(0);
  const [dMediaUrl, setDMediaUrl] = useState('');
  const [dMediaWidth, setDMediaWidth] = useState('100%');
  const [dMediaHeight, setDMediaHeight] = useState<number | undefined>(undefined);
  const [dMediaBorderRadius, setDMediaBorderRadius] = useState(20);
  const [dMediaObjectFit, setDMediaObjectFit] = useState('cover');

  const tStr = (unit.sub || unit.title || '').toLowerCase();
  let titleDari = '';
  let titlePT = '';
  let titleEN = '';
  if (tStr.includes('cozinha') || tStr.includes('cocina')) { titleDari = 'لغات آشپزخانه'; titlePT = 'Nossa Cozinha'; titleEN = 'Kitchen Vocabulary'; }
  else if (tStr.includes('oral') || tStr.includes('escuta') || tStr.includes('comprensión')) { titleDari = 'درک شنوایی'; titlePT = 'Compreensão Oral'; titleEN = 'Listening Comprehension'; }
  else if (tStr.includes('apresentação') || tStr.includes('presentación')) { titleDari = 'معرفی خود'; titlePT = 'Apresentação Pessoal'; titleEN = 'Personal Presentation'; }
  else if (tStr.includes('cotidiano')) { titleDari = 'انگلیسی در زندگی روزمره'; titlePT = 'Inglês no Cotidiano'; titleEN = 'Everyday English'; }
  else if (tStr.includes('digitais') || tStr.includes('digitales')) { titleDari = 'موضوعات دیجیتال'; titlePT = 'Temas Digitais'; titleEN = 'Digital Themes'; }
  else if (tStr.includes('receita') || tStr.includes('receta')) { titleDari = 'طرز تهیه غذا'; titlePT = 'Receita'; titleEN = 'Recipe'; }
  else if (tStr.includes('cores') || tStr.includes('colores')) { titleDari = 'رنگ‌ها و میوه‌ها'; titlePT = 'Cores e Frutas'; titleEN = 'Colors and Fruits'; }
  else if (tStr.includes('números') || tStr.includes('numero') || tStr.includes('número')) { titleDari = 'اعداد و مقدار'; titlePT = 'Números e Quantidade'; titleEN = 'Numbers and Quantity'; }
  else if (tStr.includes('família') || tStr.includes('familia')) { titleDari = 'خانواده من'; titlePT = 'Minha Família'; titleEN = 'My Family'; }
  else if (tStr.includes('corpo') || tStr.includes('cuerpo')) { titleDari = 'اعضای بدن'; titlePT = 'Partes do Corpo'; titleEN = 'Body Parts'; }
  else if (tStr.includes('animais') || tStr.includes('animales')) { titleDari = 'حیوانات و صداها'; titlePT = 'Animais e Sons'; titleEN = 'Animals and Sounds'; }
  else if (tStr.includes('revisão') || tStr.includes('revisión')) { titleDari = 'مرور درس'; titlePT = 'Revisão do Módulo'; titleEN = 'Module Review'; }
  else {
    titleDari = unit.title_dari || '';
    titlePT = unit.title || '';
    titleEN = unit.title_dari || '';
  }

  let mainTitle = unit.title || ''; // Default is Portuguese
  let secondaryTitle = '';
  let tertiaryTitle = unit.title_dari || ''; // English Study

  if (projectMode === 'afghan') {
    mainTitle = titleDari || unit.title_dari || ''; // Dari
    secondaryTitle = unit.title || ''; // Portuguese (Bridge)
    tertiaryTitle = titleEN || unit.title_dari || ''; // English
  } else if (projectMode === 'sareh') {
    mainTitle = unit.title_sareh || titlePT || unit.title || ''; // Prefer localized SAREH title
    secondaryTitle = '';
    tertiaryTitle = titleEN || unit.title_dari || ''; // English
  } else if (projectMode === 'spanish') {
    mainTitle = unit.title_spanish || (tStr.includes('cocina') ? 'Nuestra Cocina' : 
                tStr.includes('colores') ? 'Colores y Frutas' :
                tStr.includes('familia') ? 'Mi Familia' : 
                unit.title) || ''; // Fallback to logic or PT
    secondaryTitle = unit.title || ''; // Portuguese (Bridge)
    tertiaryTitle = titleEN || unit.title_dari || ''; // English
  }

  mainTitle = mainTitle.replace(/<[^>]*>?/gm, '').trim();
  secondaryTitle = secondaryTitle.replace(/<[^>]*>?/gm, '').trim();
  tertiaryTitle = tertiaryTitle.replace(/<[^>]*>?/gm, '').trim();

  if (secondaryTitle.toLowerCase() === mainTitle.toLowerCase()) secondaryTitle = '';
  if (tertiaryTitle.toLowerCase() === mainTitle.toLowerCase() || tertiaryTitle.toLowerCase() === secondaryTitle.toLowerCase()) tertiaryTitle = '';

  const steps: StepContent[] = [];
  // 1. Welcome Page (Guia de Estudo)
  if (unit.brief || (unit.external_links && unit.external_links.length > 0)) steps.push({ type: 'brief' });

  // 3. Atividades Interativas (Wordwall/Canva)
  (unit.embed_urls || []).forEach((e: any, i: number) => {
    const eObj = typeof e === 'string' ? { url: e } : e;
    
    // Seleção dinâmica da URL para atividades embed
    let finalUrl = eObj.url;
    if (projectMode === 'afghan' && eObj.url_afghan) finalUrl = eObj.url_afghan;
    else if (projectMode === 'spanish' && eObj.url_spanish) finalUrl = eObj.url_spanish;
    else if (projectMode === 'sareh' && eObj.url_sareh) finalUrl = eObj.url_sareh;

    steps.push({
      ...eObj,
      type: 'embed',
      url: normalizeEmbedUrl(finalUrl),
      idx: i
    });
  });

  // 4. Perguntas (Tipo Google Forms)
  unit.questions.forEach((q: any, i) => steps.push({ ...q, type: 'question', q, idx: i }));

  // 5. Finalização
  steps.push({ type: isAdmin || isMediator ? 'report' : 'congratulations' });

  const current = steps[activeStep];
  let liveEmbed = current.type === 'embed' ? (unit.embed_urls?.[current.idx as number] as any) : null;
  if (liveEmbed && editingEmbedIdx === current.idx && liveEmbedOverride) {
    liveEmbed = { ...liveEmbed, ...liveEmbedOverride };
  }

  const handleNext = () => { if (activeStep < steps.length - 1) setActiveStep(activeStep + 1); };
  const handleBack = () => { if (activeStep > 0) setActiveStep(activeStep - 1); };

  if (!current) return null;

  // Sincroniza estado do drawer — lê dados BRUTOS do unit (não do 'current' que já está processado)
  const syncDrawerToStep = (step: any) => {
    if (step.type === 'embed' && step.idx !== undefined) {
      // Lê diretamente de unit.embed_urls para pegar os valores brutos originais
      const raw = unit.embed_urls?.[step.idx];
      const rawObj = typeof raw === 'string' ? { url: raw } : (raw as any) || {};
      setDTitle(rawObj.title || '');
      setDUrl(rawObj.url || '');
      setDUrlSpanish(rawObj.url_spanish || '');
      setDUrlAfghan(rawObj.url_afghan || '');
      setDUrlSareh(rawObj.url_sareh || '');
      setDHeight(rawObj.height || 600);
      setDScale(rawObj.scale !== undefined ? rawObj.scale : 1);
      setDBorderRadius(rawObj.borderRadius !== undefined ? rawObj.borderRadius : 40);
      setDFrameColor(rawObj.frameColor || '');
    } else if (step.type === 'question' && step.q) {
      setDQText(step.q.q || '');
      setDQOptions([...(step.q.opts || step.q.options || [])]);
    } else if (step.type === 'brief') {
      // Lê diretamente de unit.external_links para pegar os valores brutos
      const firstMedia = (unit.external_links || [])[0] as any;
      setDMediaIdx(0);
      setDMediaUrl(firstMedia?.url || '');
      setDMediaWidth(firstMedia?.width || '100%');
      setDMediaHeight(firstMedia?.height);
      setDMediaBorderRadius(firstMedia?.borderRadius !== undefined ? firstMedia.borderRadius : 20);
      setDMediaObjectFit(firstMedia?.objectFit || 'cover');
    }
  };

  const handleDrawerSave = async () => {
    setDrawerSaving(true);
    try {
      if (current.type === 'embed' && current.idx !== undefined) {
        const updatedEmbeds = [...(unit.embed_urls || [])] as any[];
        updatedEmbeds[current.idx] = {
          ...updatedEmbeds[current.idx],
          title: dTitle,
          url: normalizeEmbedUrl(dUrl),
          url_spanish: dUrlSpanish,
          url_afghan: dUrlAfghan,
          url_sareh: dUrlSareh,
          height: dHeight,
          scale: dScale,
          borderRadius: dBorderRadius,
          frameColor: dFrameColor,
        };
        await handleUpdateUnitContent({ embed_urls: updatedEmbeds });
      } else if (current.type === 'question' && current.idx !== undefined) {
        const updatedQs = [...(unit.questions || [])] as any[];
        updatedQs[current.idx] = {
          ...updatedQs[current.idx],
          q: dQText,
          opts: dQOptions,
          options: dQOptions,
        };
        await handleUpdateUnitContent({ questions: updatedQs });
      } else if (current.type === 'brief') {
        const updatedLinks = [...(unit.external_links || [])] as any[];
        if (updatedLinks[dMediaIdx] !== undefined) {
          updatedLinks[dMediaIdx] = {
            ...updatedLinks[dMediaIdx],
            url: dMediaUrl,
            width: dMediaWidth,
            height: dMediaHeight,
            borderRadius: dMediaBorderRadius,
            objectFit: dMediaObjectFit,
          };
        } else {
          // Cria nova mídia se não existir
          updatedLinks.push({
            label: 'media',
            url: dMediaUrl,
            width: dMediaWidth,
            height: dMediaHeight,
            borderRadius: dMediaBorderRadius,
            objectFit: dMediaObjectFit,
          });
        }
        await handleUpdateUnitContent({ external_links: updatedLinks });
      }
      setDrawerSaved(true);
      setTimeout(() => setDrawerSaved(false), 2000);
    } catch (e) {
      console.error('Drawer save error:', e);
    } finally {
      setDrawerSaving(false);
    }
  };

  const handleStepChange = (newStep: number) => {
    setActiveStep(newStep);
    const nextStep = steps[newStep];
    if (nextStep) syncDrawerToStep(nextStep);
    setDrawerSaved(false);
  };

  // LIVE PREVIEW: quando o drawer está aberto, a aula usa os valores do drawer
  // em vez dos valores salvos — assim o admin vê as mudanças em tempo real
  const previewLiveEmbed = drawerOpen && current.type === 'embed' ? {
    ...current,
    title: dTitle,
    height: dHeight,
    scale: dScale,
    borderRadius: dBorderRadius,
    frameColor: dFrameColor,
    url: normalizeEmbedUrl(
      projectMode === 'afghan' ? (dUrlAfghan || dUrl) :
      projectMode === 'spanish' ? (dUrlSpanish || dUrl) :
      projectMode === 'sareh' ? (dUrlSareh || dUrl) :
      dUrl
    ),
  } : liveEmbed || current;

  // LIVE PREVIEW: external_links com valores do drawer para a mídia editada
  const liveExternalLinks = drawerOpen && current.type === 'brief'
    ? (unit.external_links || []).map((m: any, i: number) =>
        i === dMediaIdx ? { ...m, url: dMediaUrl, width: dMediaWidth, height: dMediaHeight, borderRadius: dMediaBorderRadius, objectFit: dMediaObjectFit } : m
      )
    : (unit.external_links || []);

  return (
    <div className={`activities-v5-wrapper step-type-${current.type}`} style={{ position: 'relative' }}>
      <div style={{ position: 'fixed', top: 10, left: 10, background: 'rgba(0,0,0,0.8)', color: 'white', padding: '5px 10px', borderRadius: '5px', zIndex: 999999, fontSize: '12px', fontWeight: 'bold', pointerEvents: 'none' }}>
        Screen 4: Activities
      </div>
      <div className="profile-header-image-style" style={{ margin: '4px auto 0' }}>
        <div className="avatar-and-name">
          <h2 style={{ fontSize: '20px', margin: 0, fontWeight: 900 }}>Projeto Pontes da Esperança ☀️</h2>
        </div>
        <div className="header-nav-mini">
          <button className="header-nav-btn-v7 prev" onClick={() => handleStepChange(activeStep - 1)} disabled={activeStep === 0}><ChevronLeft size={20} /></button>
          <button className="header-nav-btn-v7 next next-step-glow" onClick={() => handleStepChange(activeStep + 1)} disabled={activeStep === steps.length - 1} style={{ animation: activeStep < steps.length - 1 ? 'glowPulse 2s ease-in-out infinite' : 'none' }}><ChevronRight size={20} /></button>
          <button className="exit-btn-v7" onClick={onToggle}><X size={20} /></button>
        </div>
      </div>

      <div className="activities-v5-main" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', gap: '20px', overflow: 'visible' }}>

        {current.type === 'brief' && (
          <div className="mission-intro-card-v7 dynamic-wrap-v7">
            <div className="mission-content-v7">
              <span className="mission-tag-v7">GUIA DE ESTUDO</span>
              <h1 className="mission-subtitle-v7 main-theme" style={{ direction: projectMode === 'afghan' ? 'rtl' : 'ltr' }}>
                {mainTitle.replace(/<[^>]*>?/gm, '')}
              </h1>
              {secondaryTitle && <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink4)', marginTop: '-15px', marginBottom: '4px' }}>{secondaryTitle}</div>}
              {tertiaryTitle && <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink3)', fontStyle: 'italic', marginBottom: '15px' }}>{tertiaryTitle}</div>}
              <div dangerouslySetInnerHTML={{ __html: unit.brief || '' }} style={{ fontSize: '16px', lineHeight: '1.6' }} />
              {isAdmin && <button className="play-btn-v7-mission" onClick={() => setIsEditingBrief(true)} style={{ background: '#f59e0b', marginTop: '20px' }}>Editar Contenido</button>}
            </div>
            <div className="mission-media-v7">
              {/* Usa liveExternalLinks para live preview com valores do drawer */}
              {liveExternalLinks.map((media: any, i: number) => <VideoPlayerV5 key={i} media={media} />)}
            </div>
          </div>
        )}

        {current.type === 'embed' && (
          <div 
            className="mission-intro-card-v7 dynamic-wrap-v7" 
            style={{ 
              overflow: 'visible', 
              width: previewLiveEmbed.width || '100%', 
              maxWidth: previewLiveEmbed.width || '1500px',
              minHeight: previewLiveEmbed.height ? `${previewLiveEmbed.height}px` : '400px',
              borderRadius: previewLiveEmbed.borderRadius !== undefined ? `${previewLiveEmbed.borderRadius}px` : '50px',
              padding: `${previewLiveEmbed.framePadding || '0px'} 20px 60px 20px`,
              background: previewLiveEmbed.frameColor || 'white',
              boxShadow: previewLiveEmbed.frameColor === 'transparent' ? 'none' : '0 40px 100px rgba(0,0,0,0.07)',
              transition: 'all 0.2s ease',
            }}
          >
            <div className="mission-content-v7">
              <span className="mission-tag-v7" style={{ background: '#dbeafe', color: '#1d4ed8' }}>ATIVIDADE INTERATIVA</span>
              <h1 className="mission-subtitle-v7 main-theme" style={{ direction: projectMode === 'afghan' ? 'rtl' : 'ltr' }}>
                 {mainTitle.replace(/<[^>]*>?/gm, '')}
              </h1>
              {secondaryTitle && <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink4)', marginTop: '-15px', marginBottom: '4px' }}>{secondaryTitle}</div>}
              {tertiaryTitle && <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink3)', fontStyle: 'italic', marginBottom: '15px' }}>{tertiaryTitle}</div>}
              {previewLiveEmbed.brief && <div dangerouslySetInnerHTML={{ __html: previewLiveEmbed.brief }} style={{ fontSize: '16px', lineHeight: '1.6' }} />}
              {isAdmin && (
                <button 
                  className="play-btn-v7-mission" 
                  onClick={() => setEditingEmbedIdx(current.idx !== undefined ? current.idx : null)} 
                  style={{ background: '#f59e0b', marginTop: '20px' }}
                >
                  Editar Atividade (Editor Mestre) ⚡
                </button>
              )}
            </div>
            <div 
              className="mission-media-v7" 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'flex-end',
                transform: previewLiveEmbed.scale ? `scale(${previewLiveEmbed.scale})` : 'none',
                borderRadius: previewLiveEmbed.playerBorderRadius !== undefined ? `${previewLiveEmbed.playerBorderRadius}px` : (previewLiveEmbed.borderRadius !== undefined ? `${previewLiveEmbed.borderRadius}px` : '40px'),
                overflow: 'hidden',
                transition: 'all 0.2s ease',
              }}
            >
              {(() => {
                let finalEmbedTitle = previewLiveEmbed.title;
                if (projectMode === 'spanish' && previewLiveEmbed.title_spanish) finalEmbedTitle = previewLiveEmbed.title_spanish;
                else if (projectMode === 'afghan' && previewLiveEmbed.title_afghan) finalEmbedTitle = previewLiveEmbed.title_afghan;
                else if (projectMode === 'sareh' && previewLiveEmbed.title_sareh) finalEmbedTitle = previewLiveEmbed.title_sareh;
                
                return (
                  <EmbedPreview
                    url={previewLiveEmbed.url || ''}
                    title={finalEmbedTitle}
                    maskIcon={previewLiveEmbed.mystery_icon || unit.mystery_icon}
                    maskSize={previewLiveEmbed.mystery_icon_size || unit.mystery_icon_size || 280}
                  />
                );
              })()}
            </div>
          </div>
        )}

        {current.type === 'game' && (
          <div className="mission-intro-card-v7 dynamic-wrap-v7" style={{ minHeight: '300px', textAlign: 'center', flexDirection: 'column' }}>
            <h2 style={{ fontWeight: 900, marginBottom: '20px' }}>Hora do Desafio WordFall! 🎮</h2>
            <button className="play-btn-v7-mission" onClick={onStartGame} style={{ background: '#10b981', padding: '20px 60px', fontSize: '20px' }}>JOGAR AGORA</button>
          </div>
        )}

        {current.type === 'question' && (
          <div 
            className="mission-intro-card-v7 dynamic-wrap-v7" 
            style={{ 
              flexDirection: 'column', 
              alignItems: 'stretch',
              width: current.width || '100%', 
              maxWidth: '1500px',
              minHeight: '400px',
              borderRadius: '50px',
              padding: '60px',
              background: 'white',
              boxShadow: '0 40px 100px rgba(0,0,0,0.07)'
            }}
          >
            <div style={{ marginBottom: '10px' }}>
              <span className="mission-tag-v7" style={{ background: '#f3e8ff', color: '#7c3aed' }}>PERGUNTA {(current.idx as number) + 1}</span>
            </div>
            <QuestionBlock question={current.q as any} index={current.idx as any} unitId={unit.id} onSaveAnswer={(val) => onSaveAnswer(current.idx as any, val)} isAdmin={isAdmin} color={currentColors?.main || '#10b981'} />
          </div>
        )}

        {current.type === 'report' && (
          <div className="mission-intro-card-v7" style={{ textAlign: 'center', padding: '60px', maxWidth: '800px', width: '100%' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--ink1)', marginBottom: '10px' }}>Relatório do Mediador</h2>
            <p style={{ color: '#64748b', marginBottom: '30px' }}>Documente como foi o desempenho do aluno nesta aula.</p>
            <textarea 
              placeholder="Escreva aqui suas observações (ex: O aluno teve dificuldade com a pronúncia de 'Spoon')..."
              style={{ width: '100%', minHeight: '200px', padding: '20px', borderRadius: '20px', border: '2px solid #e2e8f0', fontSize: '16px', marginBottom: '20px', resize: 'vertical' }}
              id="report-note"
            ></textarea>
            <button 
              className="play-btn-v7-mission"
              style={{ background: '#10b981', padding: '15px 40px', fontSize: '18px' }}
              onClick={async () => {
                const note = (document.getElementById('report-note') as HTMLTextAreaElement).value;
                if (!note) return alert('Por favor, escreva uma observação antes de salvar.');
                const success = await onSaveSession(note);
                if (success) {
                  alert('Relatório salvo com sucesso!');
                  onToggle?.();
                }
              }}
            >
              SALVAR RELATÓRIO E FINALIZAR
            </button>
          </div>
        )}

        {current.type === 'congratulations' && (
          <div className="mission-intro-card-v7" style={{ textAlign: 'center', padding: '60px', maxWidth: '800px', width: '100%' }}>
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>🎉</div>
            <h2 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--ink1)', marginBottom: '10px' }}>Parabéns!</h2>
            <p style={{ fontSize: '18px', color: '#64748b', marginBottom: '40px' }}>Você completou todos os desafios da aula <strong>{unit.title}</strong>.</p>
            <button 
              className="play-btn-v7-mission"
              style={{ background: 'var(--color-accent-blue)', padding: '15px 40px', fontSize: '18px' }}
              onClick={() => onToggle?.()}
            >
              VOLTAR PARA AS AULAS
            </button>
          </div>
        )}

      </div>

      {/* ============================================================ */}
      {/* PAINEL RECOLHÍVEL DO ADMIN — aparece sobre a tela real do aluno */}
      {/* ============================================================ */}
      {isAdmin && (current.type === 'embed' || current.type === 'question' || current.type === 'brief') && (
        <>
          {/* Aba/gatilho flutuante na borda direita */}
          <button
            onClick={() => {
              if (!drawerOpen) syncDrawerToStep(current);
              setDrawerOpen(!drawerOpen);
            }}
            style={{
              position: 'fixed',
              right: drawerOpen ? '380px' : '0px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10001,
              background: drawerOpen ? '#f59e0b' : 'linear-gradient(135deg, #f59e0b, #ef4444)',
              color: 'white',
              border: 'none',
              padding: '14px 10px',
              borderRadius: drawerOpen ? '14px 0 0 14px' : '14px 0 0 14px',
              cursor: 'pointer',
              fontWeight: 900,
              fontSize: '11px',
              letterSpacing: '0.5px',
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
              transition: 'right 0.35s cubic-bezier(0.4,0,0.2,1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '16px', writingMode: 'horizontal-tb' }}>{drawerOpen ? '→' : '⚙️'}</span>
            <span>{drawerOpen ? 'FECHAR' : 'AJUSTES'}</span>
          </button>

          {/* Painel lateral deslizante */}
          <div style={{
            position: 'fixed',
            right: drawerOpen ? '0' : '-400px',
            top: 0,
            height: '100vh',
            width: '380px',
            background: 'white',
            zIndex: 10000,
            boxShadow: '-10px 0 40px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'right 0.35s cubic-bezier(0.4,0,0.2,1)',
            borderLeft: '3px solid #f59e0b',
          }}>
            {/* Header do painel */}
            <div style={{
              padding: '18px 20px',
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
            }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 900, opacity: 0.8, letterSpacing: '1px' }}>AJUSTES DA AULA — ADMIN</div>
                <div style={{ fontSize: '16px', fontWeight: 900, marginTop: '2px' }}>
                  {current.type === 'embed' ? '🎮 Atividade Interativa' : current.type === 'question' ? '❓ Pergunta' : '📖 Guia de Estudo'}
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Corpo do painel — scrollável */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* CONTROLES DE ATIVIDADE EMBED */}
              {current.type === 'embed' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', letterSpacing: '1px' }}>TÍTULO DA ATIVIDADE</label>
                    <input
                      type="text"
                      value={dTitle}
                      onChange={(e) => setDTitle(e.target.value)}
                      style={{ padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', fontWeight: 700 }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', letterSpacing: '1px' }}>LINKS POR IDIOMA</div>
                    <div>
                      <label style={{ fontSize: '10px', fontWeight: 700, color: '#475569' }}>Padrão (Global)</label>
                      <input type="text" value={dUrl} onChange={(e) => setDUrl(e.target.value)} placeholder="https://wordwall.net/..." style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', fontWeight: 700, color: '#ef4444' }}>🇪🇸 Espanhol</label>
                      <input type="text" value={dUrlSpanish} onChange={(e) => setDUrlSpanish(e.target.value)} placeholder="Link em espanhol..." style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #fee2e2', fontSize: '12px', marginTop: '4px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', fontWeight: 700, color: '#10b981' }}>🇦🇫 Dari (Afegão)</label>
                      <input type="text" value={dUrlAfghan} onChange={(e) => setDUrlAfghan(e.target.value)} placeholder="Link em Dari..." style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #d1fae5', fontSize: '12px', marginTop: '4px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', fontWeight: 700, color: '#3b82f6' }}>🌸 Sareh</label>
                      <input type="text" value={dUrlSareh} onChange={(e) => setDUrlSareh(e.target.value)} placeholder="Link em Sareh..." style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #dbeafe', fontSize: '12px', marginTop: '4px' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', letterSpacing: '1px' }}>DESIGN DO FRAME</div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        <span>Altura</span><span>{dHeight}px</span>
                      </div>
                      <input type="range" min="200" max="1000" step="10" value={dHeight} onChange={(e) => setDHeight(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#f59e0b' }} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        <span>Zoom do iFrame</span><span>{dScale}×</span>
                      </div>
                      <input type="range" min="0.5" max="2" step="0.05" value={dScale} onChange={(e) => setDScale(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#f59e0b' }} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        <span>Bordas arredondadas</span><span>{dBorderRadius}px</span>
                      </div>
                      <input type="range" min="0" max="80" step="2" value={dBorderRadius} onChange={(e) => setDBorderRadius(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#f59e0b' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Cor de fundo</div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {[
                          { label: 'Padrão', value: '' },
                          { label: 'Branco', value: 'white' },
                          { label: 'Transparente', value: 'transparent' },
                          { label: 'Azul', value: '#dbeafe' },
                          { label: 'Verde', value: '#d1fae5' },
                          { label: 'Cinza', value: '#f1f5f9' },
                        ].map(c => (
                          <button
                            key={c.value}
                            onClick={() => setDFrameColor(c.value)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '8px',
                              border: dFrameColor === c.value ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                              background: c.value || '#fff8f0',
                              fontSize: '10px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.15s'
                            }}
                          >{c.label}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Botão para abrir o editor avançado */}
                  <button
                    onClick={() => { setEditingEmbedIdx(current.idx !== undefined ? current.idx : null); setDrawerOpen(false); }}
                    style={{ padding: '10px', borderRadius: '10px', border: '1.5px dashed #f59e0b', background: '#fffbeb', color: '#92400e', fontWeight: 900, fontSize: '12px', cursor: 'pointer' }}
                  >
                    ⚡ Abrir Editor Avançado Completo
                  </button>
                </>
              )}

              {/* CONTROLES DE PERGUNTA */}
              {current.type === 'question' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', letterSpacing: '1px' }}>TEXTO DA PERGUNTA</label>
                    <textarea
                      value={dQText}
                      onChange={(e) => setDQText(e.target.value)}
                      rows={3}
                      style={{ padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '14px', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', letterSpacing: '1px' }}>OPÇÕES DE RESPOSTA</div>
                    {dQOptions.map((opt, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#8b5cf6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900, flexShrink: 0 }}>{i + 1}</div>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => { const next = [...dQOptions]; next[i] = e.target.value; setDQOptions(next); }}
                          style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                        />
                        <button
                          onClick={() => setDQOptions(dQOptions.filter((_, idx) => idx !== i))}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setDQOptions([...dQOptions, 'Nova opção'])}
                      style={{ padding: '8px', borderRadius: '8px', border: '1.5px dashed #8b5cf6', background: 'transparent', color: '#7c3aed', fontWeight: 900, fontSize: '12px', cursor: 'pointer' }}
                    >
                      + Adicionar opção
                    </button>
                  </div>

                  <button
                    onClick={() => { setEditingQuestionIdx(current.idx !== undefined ? current.idx : null); setDrawerOpen(false); }}
                    style={{ padding: '10px', borderRadius: '10px', border: '1.5px dashed #8b5cf6', background: '#f3e8ff', color: '#6d28d9', fontWeight: 900, fontSize: '12px', cursor: 'pointer' }}
                  >
                    ⚡ Abrir Editor Avançado Completo
                  </button>
                </>
              )}

              {/* CONTROLES DE GUIA DE ESTUDO */}
              {current.type === 'brief' && (() => {
                const links = unit.external_links || [];
                return (
                  <>
                    {/* Seletor de mídia se houver mais de uma */}
                    {links.length > 1 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {links.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              const m = links[i];
                              setDMediaIdx(i);
                              setDMediaUrl(m?.url || '');
                              setDMediaWidth(m?.width || '100%');
                              setDMediaHeight(m?.height);
                              setDMediaBorderRadius(m?.borderRadius !== undefined ? m.borderRadius : 20);
                              setDMediaObjectFit(m?.objectFit || 'cover');
                            }}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '8px',
                              border: dMediaIdx === i ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                              background: dMediaIdx === i ? '#eff6ff' : '#f8fafc',
                              fontWeight: 900, fontSize: '11px', cursor: 'pointer'
                            }}
                          >Imagem {i + 1}</button>
                        ))}
                      </div>
                    )}

                    {/* Preview em miniatura da imagem atual */}
                    {dMediaUrl && (
                      <div style={{ width: '100%', borderRadius: `${dMediaBorderRadius}px`, overflow: 'hidden', maxHeight: '140px', background: '#f1f5f9' }}>
                        <img
                          src={dMediaUrl}
                          alt="Preview"
                          style={{ width: '100%', height: '140px', objectFit: dMediaObjectFit as any, display: 'block' }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                    )}

                    {/* URL da imagem */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', letterSpacing: '1px' }}>URL DA IMAGEM / VÍDEO</label>
                      <input
                        type="text"
                        value={dMediaUrl}
                        onChange={(e) => setDMediaUrl(e.target.value)}
                        placeholder="https://... (imagem ou vídeo)"
                        style={{ padding: '10px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '12px' }}
                      />
                    </div>

                    {/* Controles visuais */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', letterSpacing: '1px' }}>TAMANHO E FORMA</div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                          <span>Largura</span><span>{dMediaWidth}</span>
                        </div>
                        <input
                          type="range" min="20" max="100" step="5"
                          value={parseInt(dMediaWidth) || 100}
                          onChange={(e) => setDMediaWidth(`${e.target.value}%`)}
                          style={{ width: '100%', accentColor: '#3b82f6' }}
                        />
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                          <span>Altura</span><span>{dMediaHeight ? `${dMediaHeight}px` : 'Auto'}</span>
                        </div>
                        <input
                          type="range" min="100" max="800" step="10"
                          value={dMediaHeight || 400}
                          onChange={(e) => setDMediaHeight(parseInt(e.target.value))}
                          style={{ width: '100%', accentColor: '#3b82f6' }}
                        />
                        <button
                          onClick={() => setDMediaHeight(undefined)}
                          style={{ marginTop: '4px', fontSize: '10px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                        >Resetar para Auto</button>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                          <span>Bordas arredondadas</span><span>{dMediaBorderRadius}px</span>
                        </div>
                        <input
                          type="range" min="0" max="100" step="4"
                          value={dMediaBorderRadius}
                          onChange={(e) => setDMediaBorderRadius(parseInt(e.target.value))}
                          style={{ width: '100%', accentColor: '#3b82f6' }}
                        />
                      </div>

                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Modo de exibição</div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {['cover', 'contain', 'fill'].map(fit => (
                            <button
                              key={fit}
                              onClick={() => setDMediaObjectFit(fit)}
                              style={{
                                flex: 1, padding: '6px 4px',
                                borderRadius: '8px',
                                border: dMediaObjectFit === fit ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                                background: dMediaObjectFit === fit ? '#eff6ff' : 'white',
                                fontSize: '10px', fontWeight: 800, cursor: 'pointer'
                              }}
                            >{fit}</button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Link para editor completo */}
                    <button
                      onClick={() => { setIsEditingBrief(true); setDrawerOpen(false); }}
                      style={{ padding: '10px', borderRadius: '10px', border: '1.5px dashed #3b82f6', background: '#eff6ff', color: '#1d4ed8', fontWeight: 900, fontSize: '12px', cursor: 'pointer' }}
                    >
                      ⚡ Abrir Editor Completo (texto + mídias)
                    </button>
                  </>
                );
              })()}

            </div>

            {/* Footer com botão Salvar */}
            {(current.type === 'embed' || current.type === 'question' || current.type === 'brief') && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', background: '#fafafa', flexShrink: 0 }}>
                <button
                  onClick={handleDrawerSave}
                  disabled={drawerSaving}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '14px',
                    border: 'none',
                    background: drawerSaved ? '#10b981' : 'linear-gradient(135deg, #f59e0b, #ef4444)',
                    color: 'white',
                    fontWeight: 900,
                    fontSize: '15px',
                    cursor: drawerSaving ? 'wait' : 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: '0 8px 20px rgba(245,158,11,0.3)',
                  }}
                >
                  {drawerSaving ? '⏳ Salvando...' : drawerSaved ? '✓ Salvo com sucesso!' : '💾 Salvar Ajustes'}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {isEditingBrief && (
        <BriefEditor
          unit={unit}
          projectMode={projectMode}
          mainTitle={mainTitle}
          secondaryTitle={secondaryTitle}
          tertiaryTitle={tertiaryTitle}
          handleUpdateUnitContent={handleUpdateUnitContent}
          onClose={() => setIsEditingBrief(false)}
        />
      )}

      {editingEmbedIdx !== null && (
        <EmbedEditor
          unit={unit}
          editingEmbedIdx={editingEmbedIdx}
          onChange={setLiveEmbedOverride}
          projectMode={projectMode}
          mainTitle={mainTitle}
          handleUpdateUnitContent={handleUpdateUnitContent}
          onClose={() => { setEditingEmbedIdx(null); setLiveEmbedOverride(null); }}
        />
      )}

      {editingQuestionIdx !== null && (
        <QuestionEditor
          unit={unit}
          editingQuestionIdx={editingQuestionIdx}
          handleUpdateUnitContent={handleUpdateUnitContent}
          onClose={() => setEditingQuestionIdx(null)}
          currentColors={currentColors}
        />
      )}

      <style>{`
        .activities-v5-wrapper, .activities-v5-main { overflow: visible !important; position: relative !important; }
        .dynamic-wrap-v7 {
          display: flex !important;
          flex-direction: row !important;
          align-items: flex-start !important;
          gap: 60px !important;
          background: white;
          padding: 30px 60px 60px;
          border-radius: 50px;
          overflow: visible !important;
          box-shadow: 0 40px 100px rgba(0,0,0,0.07);
          width: 100%;
          max-width: 1000px;
          min-height: 400px;
          height: auto !important;
          transition: all 0.3s ease !important;
          margin: 0 auto !important;
        }
        .mission-content-v7 { flex: 1 1 auto !important; min-width: 300px !important; }
        .mission-media-v7 { flex: 3 1 auto !important; display: flex !important; flex-direction: column !important; align-items: flex-end !important; width: 100%; }
        .step-type-brief .mission-content-v7 { flex: 1.5 1 auto !important; min-width: 300px !important; }
        .step-type-brief .mission-media-v7 { flex: 1 1 auto !important; max-width: 500px !important; display: flex !important; flex-direction: column !important; align-items: flex-end !important; width: 100%; }


        /* Estilos delegados ao componente EmbedPreview (glassmorphism) */
        .embed-preview {
          width: 100% !important;
          max-width: 520px !important;
          cursor: pointer !important;
        }

        .media-renderer-v10 iframe {          transition: transform 0.3s ease !important;
        }

        @media (max-width: 800px) {
          .dynamic-wrap-v7 { flex-direction: column !important; padding: 25px !important; text-align: center !important; }
          .mission-content-v7 { min-width: 0 !important; }
        }

        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.4), 0 0 60px rgba(16, 185, 129, 0.15); transform: scale(1); }
          50% { box-shadow: 0 0 30px rgba(16, 185, 129, 0.6), 0 0 80px rgba(16, 185, 129, 0.25); transform: scale(1.03); }
        }
        .next-step-glow:hover {
          transform: scale(1.06) !important;
          box-shadow: 0 0 40px rgba(16, 185, 129, 0.7), 0 0 100px rgba(16, 185, 129, 0.3) !important;
        }


      `}</style>
    </div>
  );
};

// --- HELPERS ---
export const normalizeEmbedUrl = (rawUrl: any): string => {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let trimmed = rawUrl.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('<iframe')) {
    const srcMatch = trimmed.match(/src=["'](.*?)["']/);
    if (srcMatch && srcMatch[1]) trimmed = srcMatch[1];
  }
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    if (url.hostname.includes('wordwall.net')) {
      if (url.pathname.includes('/resource/') && !url.pathname.includes('/embed/')) {
        url.pathname = url.pathname.replace('/resource/', '/embed/resource/');
      }
      return url.toString();
    }
    if (url.hostname.includes('youtube.com') && url.pathname === '/watch') {
      const videoId = url.searchParams.get('v');
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.hostname.includes('youtu.be')) {
      const videoId = url.pathname.replace('/', '');
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.hostname.includes('canva.com') && url.pathname.includes('/view')) {
      url.pathname = url.pathname.replace('/view', '/view?embed');
      return url.toString();
    }
    if (url.hostname.includes('drive.google.com')) {
      url.pathname = url.pathname.replace(/\/view$/, '/preview');
      return url.toString();
    }
    return url.toString();
  } catch {
    return trimmed;
  }
};
type StepType = 'brief' | 'game' | 'embed' | 'question' | 'report' | 'congratulations';
type StepContent = { type: StepType; title?: string; title_dari?: string; mechanic?: string; xp?: number; url?: string; idx?: number; q?: any; brief?: string; mystery_icon?: string; mystery_icon_size?: number; width?: string; height?: number; borderRadius?: number; playerBorderRadius?: number; scale?: number; framePadding?: string; frameColor?: string; };
export const Activities: React.FC<any> = ({ units, ...props }) => {
  const activeUnit = useMemo(() => {
    const targetId = props.initialExpandedId || null;
    return units.find((u: any) => u.id === targetId) || null;
  }, [units, props.initialExpandedId]);

  if (!activeUnit) return <div style={{ padding: '60px', textAlign: 'center' }}>Selecciona una clase en el mapa.</div>;
  return <StepNavigation unit={activeUnit} {...props} handleUpdateUnitContent={async (u: any) => { const result = await props.onUpdateUnit(activeUnit.id, u); return result; }} completeLesson={async () => ({})} />;
};
export const UnitCard: React.FC<any> = (props) => <StepNavigation {...props} handleUpdateUnitContent={async () => ({ success: true })} completeLesson={async () => ({})} editQuestion={() => { }} deleteQuestion={() => { }} />;
export default Activities;
