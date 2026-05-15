import React, { useState } from 'react';
import type { Unit, Question, EmbedActivity, Session } from '../../types';
import { Printer, Save, CheckCircle, Trash2, Plus, Lock, Unlock, ClipboardList, RotateCcw } from 'lucide-react';
import { COLORS } from '../../constants';
import { QuestionBlock } from './QuestionBlock';

interface PlanningProps {
  units: Unit[];
  sessions: Session[];
  isAdmin: boolean;
  settings: any;
  onUpdateUnit: (id: string, updates: Partial<Unit>) => Promise<{ success: boolean; error?: string }>;
  onEditDetails: (id: string) => void;
  onSaveSession: (unitId: string, note: string) => Promise<boolean>;
  onResetProgress: (id: string) => Promise<boolean>;
}

const AdminUnitResourceRow: React.FC<{ 
  unit: Unit, 
  sessions: Session[],
  onSave: (id: string, updates: Partial<Unit>) => Promise<{ success: boolean; error?: string }>,
  onEditDetails: (id: string) => void,
  onSaveSession: (unitId: string, note: string) => Promise<boolean>,
  onResetProgress: (id: string) => Promise<boolean>
}> = ({ unit, sessions, onSave, onEditDetails, onSaveSession, onResetProgress }) => {
  const [showReports, setShowReports] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const unitSessions = sessions.filter(s => s.unit_id === unit.id);

  const handleAddReport = async () => {
     if (!newNote.trim()) return;
     setIsSaving(true);
     const success = await onSaveSession(unit.id, newNote);
     if (success) {
        setNewNote('');
        setShowReports(true);
     }
     setIsSaving(false);
  };

  return (
    <div className="admin-unit-card-simple" style={{ background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', marginBottom: '12px', overflow: 'hidden' }}>
      <div className="admin-unit-header-simple" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="unit-dot" style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS[unit.color]?.main || COLORS.emerald?.main || '#10b981' }}></div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '10px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Clase / Unidad</span>
            <strong style={{ fontSize: '15px', color: '#1e293b' }}>{unit.title}</strong>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={async (e) => {
              e.stopPropagation();
              if (window.confirm(`¿Estás seguro de que deseas reiniciar el progreso (borrar respuestas) SOLO de la unidad "${unit.title}"? Esto no afecta los informes.`)) {
                await onResetProgress(unit.id);
                alert('¡Progreso reiniciado con éxito!');
              }
            }}
            title="Reiniciar Progreso del Alumno en esta unidad"
            style={{
              padding: '10px',
              borderRadius: '12px',
              border: '1px solid #fecaca',
              background: '#fef2f2',
              color: '#ef4444',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <RotateCcw size={18} />
          </button>

          <button 
            onClick={() => setShowReports(!showReports)}
            className={`admin-report-btn ${showReports ? 'active' : ''}`}
            title="Ver Informes del Mediador"
            style={{
              padding: '10px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              background: showReports ? '#f0fdfa' : 'white',
              color: showReports ? '#10b981' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <ClipboardList size={18} />
          </button>

          <button 
            className={`admin-lock-toggle ${unit.is_locked ? 'locked' : 'unlocked'}`}
            onClick={async (e) => {
              e.stopPropagation();
              const newLockedState = !unit.is_locked;
              const result = await onSave(unit.id, { is_locked: newLockedState });
              if (!result.success) {
                alert('Error al ' + (newLockedState ? 'bloquear' : 'desbloquear') + ' unidad: ' + (result.error || 'Error desconocido.'));
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: '800',
              padding: '8px 14px',
              borderRadius: '10px',
              background: unit.is_locked ? '#fee2e2' : '#f8fafc',
              color: unit.is_locked ? '#ef4444' : '#64748b',
              border: '1px solid',
              borderColor: unit.is_locked ? '#fecaca' : '#e2e8f0',
              cursor: 'pointer'
            }}
          >
            {unit.is_locked ? <Lock size={14} /> : <Unlock size={14} />}
          </button>
          
          <button 
            className="admin-edit-details-btn-premium" 
            onClick={() => onEditDetails(unit.id)}
            style={{ 
              fontSize: '11px', 
              fontWeight: '900', 
              padding: '10px 20px', 
              borderRadius: '12px', 
              background: '#1e293b', 
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ADMINISTRAR ⚙️
          </button>
        </div>
      </div>

      {showReports && (
        <div className="unit-reports-panel" style={{ padding: '0 16px 16px', borderTop: '1px solid #f8fafc' }}>
           <div className="reports-history" style={{ marginTop: '16px' }}>
              <h4 style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' }}>Historial de Informes</h4>
              {unitSessions.length === 0 ? (
                 <div style={{ padding: '20px', textAlign: 'center', color: '#cbd5e1', fontSize: '13px', background: '#f8fafc', borderRadius: '12px', marginBottom: '15px' }}>
                    Ningún informe registrado aún.
                 </div>
              ) : (
                 <div className="sessions-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                    {unitSessions.map(s => (
                       <div key={s.id} style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                             <span style={{ fontSize: '10px', fontWeight: 800, color: '#10b981' }}>{s.session_date}</span>
                             <span style={{ fontSize: '9px', color: '#94a3b8' }}>Profesor Mediador</span>
                          </div>
                          <p style={{ fontSize: '13px', color: '#475569', margin: 0, whiteSpace: 'pre-wrap' }}>{s.note}</p>
                       </div>
                    ))}
                 </div>
              )}
           </div>

           <div className="new-report-input">
              <textarea 
                 value={newNote}
                 onChange={(e) => setNewNote(e.target.value)}
                 placeholder="Escribe aquí el informe del profesor mediador sobre esta actividad..."
                 style={{ 
                    width: '100%', 
                    height: '80px', 
                    padding: '12px', 
                    borderRadius: '12px', 
                    border: '2px solid #f1f5f9', 
                    fontSize: '13px', 
                    fontFamily: 'inherit',
                    resize: 'none',
                    marginBottom: '10px'
                 }}
              />
              <button 
                 onClick={handleAddReport}
                 disabled={!newNote.trim() || isSaving}
                 style={{ 
                    width: '100%', 
                    padding: '10px', 
                    borderRadius: '10px', 
                    background: '#10b981', 
                    color: 'white', 
                    border: 'none', 
                    fontWeight: 800, 
                    fontSize: '12px',
                    cursor: 'pointer',
                    opacity: (!newNote.trim() || isSaving) ? 0.5 : 1
                 }}
              >
                 {isSaving ? 'Guardando...' : 'GUARDAR INFORME 📋'}
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export const Planning: React.FC<PlanningProps> = ({ units, sessions, isAdmin, settings, onUpdateUnit, onEditDetails, onSaveSession, onResetProgress }) => {
  const handlePrint = () => {
    window.print();
  };

  const sortedUnits = React.useMemo(() => {
    return [...units].sort((a, b) => {
      const numA = parseInt(a.title.match(/\d+/)?.[0] || '999');
      const numB = parseInt(b.title.match(/\d+/)?.[0] || '999');
      return numA - numB;
    });
  }, [units]);

  return (
    <div className="screen">
      <div className="plan-header-card no-print">
        <strong>Generador de Plan Oficial</strong><br />
        Configura el PTD y expórtalo en el formato estándar de la escuela.
      </div>

      <div className="plan-table-wrap">
        <div className="official-document-header">
          <div className="header-top-row">
            <div className="inst-text">
              <div className="inst-name">COLÉGIO ESTADUAL NOSSA SENHORA DE LOURDES</div>
              <div className="inst-levels">ENSINO FUNDAMENTAL, MÉDIO E PROFISSIONAL</div>
            </div>
          </div>
          
          <h2 className="doc-title">PLAN DE TRABAJO DOCENTE - Proyecto Puentes de Esperanza</h2>
          
          <table className="meta-table">
            <tbody>
              <tr>
                <td colSpan={3}><strong>Estudiante:</strong> Ione Jordão Ribeiro</td>
              </tr>
              <tr>
                <td colSpan={2}><strong>Áreas de Conocimiento:</strong> Lengua Inglesa</td>
                <td><strong>Año:</strong> 2026</td>
              </tr>
              <tr>
                <td colSpan={2}><strong>Profesor(a):</strong> ENGLISH CLASSES</td>
                <td><strong>2º y 3º trimestres</strong></td>
              </tr>
              <tr>
                <td colSpan={3}><strong>Institución de matrícula:</strong> Colégio Estadual Nossa Senhora de Lourdes</td>
              </tr>
              <tr>
                <td><strong>Fecha inicio atención:</strong> {settings?.start_date || '05/02/2026'}</td>
                <td><strong>Tiempo Certificado Médico:</strong> {settings?.medical_period || '05/02/2026 a 19/12/2026'}</td>
                <td><strong>CID:</strong> {settings?.cid_code || 'G71.2 / J96.1'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <table className="plan-table official">
          <thead>
            <tr>
              <th><u>Contenidos</u></th>
              <th><u>Habilidades/Objetivos de aprendizaje</u></th>
              <th><u>Orientaciones metodológicas y recursos didácticos</u></th>
              <th><u>Criterios/instrumentos de evaluación</u></th>
            </tr>
          </thead>
          <tbody>
            {sortedUnits.map((unit) => (
              <tr key={unit.id}>
                <td 
                  contentEditable={isAdmin}
                  onBlur={(e) => onUpdateUnit(unit.id, { plan_c: e.currentTarget.innerText })}
                  suppressContentEditableWarning
                >
                  {unit.plan_c}
                </td>
                <td 
                  contentEditable={isAdmin}
                  onBlur={(e) => onUpdateUnit(unit.id, { plan_h: e.currentTarget.innerText })}
                  suppressContentEditableWarning
                >
                  {unit.plan_h}
                </td>
                <td 
                  contentEditable={isAdmin}
                  onBlur={(e) => onUpdateUnit(unit.id, { plan_e: e.currentTarget.innerText })}
                  suppressContentEditableWarning
                >
                  {unit.plan_e}
                </td>
                <td 
                  contentEditable={isAdmin}
                  onBlur={(e) => onUpdateUnit(unit.id, { plan_a: e.currentTarget.innerText })}
                  suppressContentEditableWarning
                >
                  {unit.plan_a}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="official-document-footer">
          <div className="signature-row">
            <div className="sig-block">
              <div className="sig-line"></div>
              <div className="sig-label">Firma del profesor:</div>
            </div>
            <div className="sig-block">
              <div className="sig-line"></div>
              <div className="sig-label">Nombre y firma del Equipo Pedagógico</div>
            </div>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="no-print" style={{ marginTop: '60px' }}>
          <h3 className="section-title-small" style={{ textAlign: 'left', marginBottom: '8px' }}>Administración de Recursos Digitales</h3>
          <p style={{ fontSize: '13px', color: 'var(--ink3)', marginBottom: '24px' }}>
            Añade juegos de Wordwall, videos o descriptores pedagógicos para cada clase.
          </p>
          
          <div className="admin-units-grid">
            {sortedUnits.map(unit => (
              <AdminUnitResourceRow 
                key={unit.id} 
                unit={unit} 
                sessions={sessions}
                onSave={onUpdateUnit} 
                onEditDetails={onEditDetails}
                onSaveSession={onSaveSession}
                onResetProgress={onResetProgress}
              />
            ))}
          </div>
        </div>
      )}

      <div className="no-print" style={{ marginTop: '20px', display: 'flex', gap: '10px', paddingBottom: '40px' }}>
        <button className="export-btn" onClick={handlePrint}>
          <Printer size={18} /> Imprimir / Generar PDF del Plan
        </button>
      </div>

      <style>{`
        @media print {
          .no-print, nav, .topbar { display: none !important; }
          .screen { padding: 0 !important; margin: 0 !important; }
          .plan-table-wrap { width: 100% !important; margin: 0 !important; overflow: visible !important; }
          .plan-table { font-size: 11px !important; border-collapse: collapse !important; width: 100% !important; border: 1px solid #000 !important; }
          .plan-table th, .plan-table td { border: 1px solid #000 !important; padding: 12px 8px !important; vertical-align: top !important; line-height: 1.4 !important; }
          .official-document-header { margin-bottom: 20px !important; }
          .meta-table td { padding: 8px !important; border: 1px solid #000 !important; }
          body { background: #fff !important; color: #000 !important; }
        }
        .plan-table.official td {
          min-height: 100px;
          white-space: pre-wrap;
        }
      `}</style>
    </div>
  );
};
