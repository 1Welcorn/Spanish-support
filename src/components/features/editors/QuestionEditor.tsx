import React, { useState, useEffect } from 'react';
import type { Unit, QuestionType } from '../../../types';
import { Zap, X, Trash2 } from 'lucide-react';
import { QuestionBlock } from '../QuestionBlock';

interface QuestionEditorProps {
  unit: Unit;
  editingQuestionIdx: number;
  handleUpdateUnitContent: (updates: Partial<Unit>) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
  currentColors?: any;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  unit,
  editingQuestionIdx,
  handleUpdateUnitContent,
  onClose,
  currentColors
}) => {
  const q = (unit.questions?.[editingQuestionIdx] as any) || {};

  const [tempQuestionText, setTempQuestionText] = useState(q.q || '');
  const [tempQuestionOptions, setTempQuestionOptions] = useState<string[]>(q.opts || q.options || []);
  const [tempQuestionCorrect, setTempQuestionCorrect] = useState(
    typeof q.correctAnswer === 'string' ? q.correctAnswer : 
    (Array.isArray(q.correctAnswer) ? q.correctAnswer[0] || '' : (q.correct || ''))
  );
  const [tempQuestionType, setTempQuestionType] = useState<QuestionType>(q.type || 'mc');
  const [tempQuestionHint, setTempQuestionHint] = useState(q.hint || '');
  const [tempQuestionMediator, setTempQuestionMediator] = useState(q.mediator || '');
  const [tempQuestionImageUrl, setTempQuestionImageUrl] = useState(q.imageUrl || '');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    const freshQ = (unit.questions?.[editingQuestionIdx] as any) || {};
    setTempQuestionText(freshQ.q || '');
    setTempQuestionOptions(freshQ.opts || freshQ.options || []);
    setTempQuestionCorrect(
      typeof freshQ.correctAnswer === 'string' ? freshQ.correctAnswer : 
      (Array.isArray(freshQ.correctAnswer) ? freshQ.correctAnswer[0] || '' : (freshQ.correct || ''))
    );
    setTempQuestionType(freshQ.type || 'mc');
    setTempQuestionHint(freshQ.hint || '');
    setTempQuestionMediator(freshQ.mediator || '');
    setTempQuestionImageUrl(freshQ.imageUrl || '');
  }, [unit, editingQuestionIdx]);

  const handleSave = async () => {
    if (editingQuestionIdx === null || !unit.questions) return;
    setSaveStatus('saving');
    try {
      const updatedQuestions = [...unit.questions];
      updatedQuestions[editingQuestionIdx] = {
        ...updatedQuestions[editingQuestionIdx],
        q: tempQuestionText,
        opts: tempQuestionOptions,
        options: tempQuestionOptions,
        correctAnswer: tempQuestionCorrect,
        correct: tempQuestionCorrect,
        type: tempQuestionType,
        hint: tempQuestionHint,
        mediator: tempQuestionMediator,
        imageUrl: tempQuestionImageUrl
      } as any;

      const result = await handleUpdateUnitContent({ questions: updatedQuestions });
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
      console.error('Exception while saving question content:', err);
      setSaveStatus('error');
      alert('Erro crítico ao salvar: ' + (err.message || 'Erro de conexão/permissão'));
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  return (
    <div className="brief-editor-overlay-v7" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#f8fafc', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '15px 30px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Zap size={24} color="#7c3aed" fill="#7c3aed" />
          <h2 style={{ margin: 0, fontWeight: 900 }}>Editor Mestre de Perguntas ⚡</h2>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleSave} style={{ background: '#10b981', color: 'white', padding: '10px 25px', borderRadius: '12px', border: 'none', fontWeight: 900, cursor: 'pointer' }}>
            {saveStatus === 'saving' ? 'Salvando...' : saveStatus === 'success' ? 'Salvo ✓' : 'Salvar Alterações'}
          </button>
          <button onClick={onClose} style={{ background: '#f1f5f9', padding: '10px', borderRadius: '12px', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px', overflow: 'hidden' }}>
        {/* Coluna 1: Campos da Pergunta e Alternativas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto', paddingRight: '10px' }}>
          <h4 style={{ margin: 0, color: '#64748b', fontSize: '11px', fontWeight: 900 }}>1. CONFIGURAÇÃO DA PERGUNTA</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>Enunciado da Pergunta</label>
            <textarea 
              value={tempQuestionText} 
              onChange={(e) => setTempQuestionText(e.target.value)} 
              placeholder="Escreva a pergunta aqui..."
              style={{ padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', minHeight: '80px', width: '100%', fontSize: '14px', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>Dica do Aluno (Dica 💡)</label>
              <input type="text" placeholder="Dica opcional..." value={tempQuestionHint} onChange={(e) => setTempQuestionHint(e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>Orientação do Mediador 🧑‍🏫</label>
              <input type="text" placeholder="Orientação do mediador..." value={tempQuestionMediator} onChange={(e) => setTempQuestionMediator(e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>Imagem da Pergunta (URL)</label>
              <input type="text" placeholder="URL da imagem opcional..." value={tempQuestionImageUrl} onChange={(e) => setTempQuestionImageUrl(e.target.value)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>Tipo da Pergunta</label>
              <select value={tempQuestionType} onChange={(e) => setTempQuestionType(e.target.value as QuestionType)} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px' }}>
                <option value="mc">Escolha Múltipla (Múltipla Escolha)</option>
                <option value="sa">Resposta Escrita / Curta</option>
              </select>
            </div>
          </div>

          {tempQuestionType === 'mc' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#7c3aed' }}>ALTERNATIVAS & RESPOSTA CORRETA</label>
                <button 
                  type="button" 
                  onClick={() => setTempQuestionOptions([...tempQuestionOptions, ''])} 
                  style={{ padding: '6px 12px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: 900, cursor: 'pointer' }}
                >
                  + Nova Opção
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {tempQuestionOptions.map((opt, oIdx) => (
                  <div key={oIdx} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#fafafa', padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <input 
                      type="radio" 
                      name="correct_choice" 
                      checked={tempQuestionCorrect === opt && opt !== ''} 
                      onChange={() => setTempQuestionCorrect(opt)} 
                      disabled={opt === ''}
                      title="Marcar como Resposta Correta"
                    />
                    <input 
                      type="text" 
                      value={opt} 
                      placeholder={`Opção ${oIdx + 1}`} 
                      onChange={(e) => {
                        const newOpts = [...tempQuestionOptions];
                        const oldVal = newOpts[oIdx];
                        newOpts[oIdx] = e.target.value;
                        setTempQuestionOptions(newOpts);
                        if (tempQuestionCorrect === oldVal && oldVal !== '') {
                          setTempQuestionCorrect(e.target.value);
                        }
                      }} 
                      style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                    />
                    <button 
                      type="button" 
                      onClick={() => {
                        const newOpts = tempQuestionOptions.filter((_, i) => i !== oIdx);
                        setTempQuestionOptions(newOpts);
                        if (tempQuestionCorrect === opt) setTempQuestionCorrect(newOpts[0] || '');
                      }} 
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Coluna 2: Visualizador Interativo */}
        <div style={{ display: 'flex', flexDirection: 'column', background: '#f1f5f9', borderRadius: '24px', overflow: 'hidden', height: '100%' }}>
          <div style={{ padding: '10px', background: '#e2e8f0', textAlign: 'center', fontSize: '10px', fontWeight: 900 }}>SIMULADOR INTERATIVO DA PERGUNTA (CLIQUE PARA TESTAR) 🎮</div>
          <div style={{ flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
            <div 
              className="mission-intro-card-v7 dynamic-wrap-v7" 
              style={{ 
                flexDirection: 'column', 
                alignItems: 'stretch',
                width: '100%', 
                maxWidth: '800px',
                minHeight: '400px',
                borderRadius: '50px',
                padding: '40px',
                background: 'white',
                boxShadow: '0 40px 100px rgba(0,0,0,0.07)',
                border: '1px solid #e2e8f0',
                margin: '0 auto'
              }}
            >
              <div style={{ marginBottom: '10px' }}>
                <span className="mission-tag-v7" style={{ background: '#f3e8ff', color: '#7c3aed' }}>PERGUNTA PREVIEW</span>
              </div>
              
              <QuestionBlock 
                question={{
                  q: tempQuestionText || 'Escreva o enunciado da pergunta no editor...',
                  opts: tempQuestionOptions,
                  options: tempQuestionOptions,
                  correctAnswer: tempQuestionCorrect,
                  correct: tempQuestionCorrect,
                  type: tempQuestionType,
                  hint: tempQuestionHint,
                  mediator: tempQuestionMediator,
                  imageUrl: tempQuestionImageUrl
                } as any} 
                index={editingQuestionIdx} 
                unitId={unit.id} 
                onSaveAnswer={async () => true} 
                isAdmin={false} 
                color={currentColors?.main || '#10b981'} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
