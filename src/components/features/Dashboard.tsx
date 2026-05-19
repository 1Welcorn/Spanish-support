import React from 'react';
import { 
  Flame, Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LessonCard } from '../ui/LessonCard';
import type { Lesson } from '../../types/index';

interface DashboardProps {
  onNavigate: (screen: string, unitId?: string) => void;
  completedPct: number;
  sessionsCount: number;
  mediatorName: string;
  mediatorPhone: string;
  units: any[];
  answers: Record<string, any>;
  isAdmin?: boolean;
  onUpdateUnit?: (id: string, updates: any) => Promise<{ success: boolean; error?: string }>;
  onSyncDefaults?: () => Promise<void>;
  t: any;
  currentStreak?: number;
  totalStars?: number;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  completedPct,
  sessionsCount,
  mediatorName,
  mediatorPhone,
  units,
  answers,
  isAdmin,
  onUpdateUnit,
  onSyncDefaults,
  t,
  currentStreak = 0,
  totalStars = 0
}) => {
  const { projectMode } = useAuth();

  const handleSupportClick = () => {
    const text = `Hola Prof. ${mediatorName}, ¡soy Ione! Necesito ayuda con las actividades de hoy.`;
    const cleanPhone = mediatorPhone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const lessonCards = React.useMemo(() => {
    return units.map((unit, idx) => {
      const hasQuestions = unit.questions && unit.questions.length > 0;
      const isDone = hasQuestions && unit.questions.every((_: any, i: number) => answers[`${unit.id}-${i}`]?.is_done);
      const isLocked = !isAdmin && (unit.is_locked || (idx > 0 && (!units[idx-1].questions || units[idx-1].questions.length === 0 || !units[idx-1].questions.every((_: any, i: number) => answers[`${units[idx-1].id}-${i}`]?.is_done))));
      
      const tStr = (unit.sub || unit.title || '').toLowerCase();
      let base = '';
      if (unit.id === 'u1') base = 'aula-1';
      else if (unit.id === 'u2') base = 'aula-2';
      else if (unit.id === 'u3') base = 'aula-3';
      else if (unit.id === 'u4') base = 'aula-4';
      else if (unit.id === 'u5') base = 'aula-5';
      else if (unit.id === 'u6') base = 'aula-6';
      else {
        if (tStr.includes('cozinha')) base = 'aula-1';
        else if (tStr.includes('família')) base = 'aula-2';
        else if (tStr.includes('cores')) base = 'aula-3';
        else if (tStr.includes('números')) base = 'aula-4';
        else if (tStr.includes('sentimentos')) base = 'aula-5';
        else if (tStr.includes('rotina')) base = 'aula-6';
      }

      let titleDari = '';
      let titlePT = '';
      let titleEN = '';
      const titleLower = tStr;
      if (titleLower.includes('cozinha') || titleLower.includes('cocina')) { titleDari = 'لغات آشپزخانه'; titlePT = 'Nossa Cozinha'; titleEN = 'Kitchen Vocabulary'; }
      else if (titleLower.includes('oral') || titleLower.includes('escuta') || titleLower.includes('comprensión')) { titleDari = 'درک شنوایی'; titlePT = 'Compreensão Oral'; titleEN = 'Listening Comprehension'; }
      else if (titleLower.includes('apresentação') || titleLower.includes('presentación')) { titleDari = 'معرفی خود'; titlePT = 'Apresentação Pessoal'; titleEN = 'Personal Presentation'; }
      else if (titleLower.includes('cotidiano')) { titleDari = 'انگلیسی در زندگی روزمره'; titlePT = 'Inglês no Cotidiano'; titleEN = 'Everyday English'; }
      else if (titleLower.includes('digitais') || titleLower.includes('digitales')) { titleDari = 'موضوعات دیجیتال'; titlePT = 'Temas Digitais'; titleEN = 'Digital Themes'; }
      else if (titleLower.includes('receita') || titleLower.includes('receta')) { titleDari = 'طرز تهیه غذا'; titlePT = 'Receita'; titleEN = 'Recipe'; }
      else if (titleLower.includes('cores') || titleLower.includes('colores')) { titleDari = 'رنگ‌ها e میوه‌ها'; titlePT = 'Cores e Frutas'; titleEN = 'Colors and Fruits'; }
      else if (titleLower.includes('números') || titleLower.includes('numero') || titleLower.includes('número')) { titleDari = 'اعداد و مقدار'; titlePT = 'Numbers e Quantidade'; titleEN = 'Numbers and Quantity'; }
      else if (titleLower.includes('família') || titleLower.includes('familia')) { titleDari = 'خانواده من'; titlePT = 'Minha Família'; titleEN = 'My Family'; }
      else if (titleLower.includes('corpo') || titleLower.includes('cuerpo')) { titleDari = 'اعضای بدن'; titlePT = 'Partes do Corpo'; titleEN = 'Body Parts'; }
      else if (titleLower.includes('animais') || titleLower.includes('animales')) { titleDari = 'حیوانات و صداها'; titlePT = 'Animais e Sons'; titleEN = 'Animals and Sounds'; }
      else if (titleLower.includes('revisão') || titleLower.includes('revisión')) { titleDari = 'مرور درس'; titlePT = 'Revisão do Módulo'; titleEN = 'Module Review'; }
      else {
        titleDari = 'درس ' + (idx + 1);
        titlePT = unit.title || '';
        titleEN = unit.title_dari || '';
      }

      const lessonData: Lesson = {
        id: unit.id,
        title: (projectMode === 'afghan' ? (titleDari || unit.title_dari) : 
                projectMode === 'sareh' ? (unit.title_sareh || unit.title) :
                projectMode === 'spanish' ? (unit.title_spanish || unit.title) :
                unit.title) || unit.sub,
        status: isDone ? 'completed' : (isLocked ? 'locked' : 'not_started'),
        iconOutline: unit.iconOutline || (base ? `/unit-icons/${base}-off.png` : ''),
        icon3D: unit.icon3D || (base ? `/unit-icons/${base}.png` : ''),
        xpValue: 100,
        titleDari: projectMode === 'afghan' ? titleDari : '',
        titlePT: titlePT || unit.title,
        titleEN: titleEN || unit.title_dari || '',
        titleSpanish: unit.title_spanish || '',
        titleSareh: unit.title_sareh || '',
        sub: unit.sub
      };

      return (
        <LessonCard 
          key={unit.id} 
          lesson={lessonData} 
          idx={idx}
          t={t}
          isAdmin={isAdmin}
          onToggleLock={async () => {
            if (onUpdateUnit) {
               const res = await onUpdateUnit(unit.id, { is_locked: !unit.is_locked });
               if (!res.success) alert('Erro ao atualizar bloqueio: ' + res.error);
            }
          }}
          onClick={() => !isLocked && onNavigate('activities', unit.id)}
        />
      );
    });
  }, [units, answers, isAdmin, onUpdateUnit, onNavigate]);



  return (
    <div className="dash-v5-container" style={{ background: 'var(--bg)', minHeight: '100vh', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.8)', color: 'white', padding: '5px 10px', borderRadius: '5px', zIndex: 999999, fontSize: '12px', fontWeight: 'bold', pointerEvents: 'none' }}>
        Screen 3: Dashboard
      </div>
      <header className="dash-v5-header" style={{ 
        background: 'rgba(154, 216, 114, 0.15)',
        backdropFilter: 'var(--glass)',
        borderBottom: '1px solid rgba(70, 132, 50, 0.1)',
        padding: '12px 24px',
        borderRadius: '0 0 var(--r-lg) var(--r-lg)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div className="dash-v5-profile">
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--ink1)', margin: 0, fontFamily: 'Fraunces, serif' }}>
            {t.welcome || 'Olá! ✨'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '4px' }}>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.5)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${completedPct}%`, height: '100%', background: '#468432', borderRadius: '3px' }} />
              </div>
            </div>
          </div>
        </div>
        <div className="dash-v5-stats" style={{ display: 'flex', gap: '8px' }}>
          <div className="stat-badge-v5" style={{ background: 'rgba(255, 160, 46, 0.2)', padding: '6px 12px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Flame size={16} fill="#FFA02E" stroke="none" />
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#FFA02E' }}>{currentStreak}</span>
          </div>
          <div className="stat-badge-v5" style={{ background: 'rgba(255, 239, 145, 0.3)', padding: '6px 12px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Star size={16} fill="#FFD700" stroke="none" />
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#468432' }}>{totalStars}</span>
          </div>
        </div>
      </header>

      <div style={{ padding: '0 24px' }}>
        <div className="module-intro-v5" style={{ textAlign: 'center', marginBottom: '8px', marginTop: '8px' }}>
           <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--ink1)', margin: '0', fontFamily: 'Fraunces, serif' }}>
              {t.module_title || 'Módulo 1: Conversação Básica 🚀'}
           </h2>
        </div>

        {units.length === 0 ? (
          <div style={{ 
            padding: '60px 20px', 
            textAlign: 'center', 
            background: 'white', 
            borderRadius: '30px', 
            border: '2px dashed #e2e8f0',
            margin: '40px auto',
            maxWidth: '600px'
          }}>
            <div style={{ fontSize: '50px', marginBottom: '20px' }}>📚</div>
            <h3 style={{ color: 'var(--ink1)', fontSize: '22px', fontWeight: 900, marginBottom: '10px' }}>Nenhuma aula encontrada</h3>
            <p style={{ color: 'var(--ink3)', marginBottom: '24px' }}>
              {isAdmin ? 'Você pode começar criando sua primeira aula ou importando os padrões no Planejamento.' : 'O mediador ainda não publicou aulas.'}
            </p>
             {isAdmin && (
               <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                 <button 
                   className="primary-btn" 
                   onClick={() => onNavigate('planning')}
                   style={{ padding: '12px 30px', borderRadius: '15px' }}
                 >
                   Ir para Planejamento ⚙️
                 </button>
                 <button 
                   className="secondary-btn" 
                   onClick={async () => {
                     if (onSyncDefaults) {
                       await onSyncDefaults();
                       alert('Aulas sincronizadas com sucesso!');
                     }
                   }}
                   style={{ padding: '12px 30px', borderRadius: '15px', background: '#f8fafc', border: '1px solid #e2e8f0' }}
                 >
                   Sincronizar Aulas Agora 🔄
                 </button>
               </div>
             )}
          </div>
        ) : (
          <div className="lessons-grid-v5" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: '24px',
              maxWidth: '1450px',
              margin: '0 auto',
              padding: '20px'
            }}>
            {lessonCards}
          </div>
        )}

        <footer style={{ marginTop: '60px', display: 'flex', justifyContent: 'center' }}>
          <div 
            onClick={handleSupportClick} 
            style={{ 
              background: 'white', 
              padding: '16px 32px', 
              borderRadius: 'var(--r-md)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '20px', 
              border: '1px solid var(--border)', 
              boxShadow: 'var(--shadow-soft)', 
              cursor: 'pointer' 
            }}
          >
            <div style={{ width: '44px', height: '44px', background: 'var(--lavender)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '18px' }}>
              {mediatorName.charAt(0)}
            </div>
            <div style={{ textAlign: 'left' }}>
               <div style={{ fontSize: '15px', fontWeight: 900, color: 'var(--ink1)' }}>Professor(a) {mediatorName}</div>
               <div style={{ fontSize: '11px', color: 'var(--ink3)', fontWeight: 600 }}>Seu Professor</div>
            </div>
            <div style={{ background: '#25D366', color: 'white', padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: 900 }}>Mensagem 💬</div>
          </div>
        </footer>
      </div>
    </div>
  );
};
