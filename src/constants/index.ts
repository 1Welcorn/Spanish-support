import type { Unit } from '../types';

export const COLORS: Record<string, { main: string; light: string; dark: string; accent: string }> = {
  gamer:    { main: '#E32636', light: '#F8F9FA', dark: '#2D3436', accent: '#00CFFF' },
  creative: { main: '#E52E2E', light: '#F8F9FA', dark: '#4361EE', accent: '#FF8C00' },
  pop:      { main: '#E52E2E', light: '#06D6A0', dark: '#7209B7', accent: '#FFD60A' },
  emerald:  { main: '#059669', light: '#ECFDF5', dark: '#064E3B', accent: '#10b981' },
  sapphire: { main: '#2563EB', light: '#EFF6FF', dark: '#1E3A8A', accent: '#60a5fa' },
  terracotta:{ main: '#D97706', light: '#FFFBEB', dark: '#451A03', accent: '#fbbf24' },
  amethyst: { main: '#7C3AED', light: '#F5F3FF', dark: '#2E1065', accent: '#a78bfa' },
  crimson:  { main: '#DC2626', light: '#FEF2F2', dark: '#450A0A', accent: '#f87171' },
  seafoam:  { main: '#059669', light: '#ECFDF5', dark: '#064E3B', accent: '#10b981' },
  royal:    { main: '#2563EB', light: '#EFF6FF', dark: '#1E3A8A', accent: '#60a5fa' },
  sunset:   { main: '#D97706', light: '#FFFBEB', dark: '#451A03', accent: '#fbbf24' },
  lavender: { main: '#7C3AED', light: '#F5F3FF', dark: '#2E1065', accent: '#a78bfa' },
  ruby:     { main: '#DC2626', light: '#FEF2F2', dark: '#450A0A', accent: '#f87171' },
  natural:  { main: '#468432', light: '#FFEF91', dark: '#2D521F', accent: '#FFA02E' },
};

export const DEFAULT_UNITS: Unit[] = [
  {
    id: 'u1',
    color: 'natural',
    sort_order: 0,
    title: 'Nossa Cozinha',
    title_dari: 'Kitchen Vocabulary',
    sub: 'Aula 1',
    icon3D: '/unit-icons/aula-1.png',
    iconOutline: '/unit-icons/aula-1-off.png',
    brief: 'Antes de começar: vá para a cozinha com o aluno e segure objetos reais. Diga o nome em inglês pausadamente.',
    plan_c: 'Vocabulário de cozinha; nomes de objetos',
    plan_h: 'Identificar palavras em inglês por contexto',
    plan_e: 'Objetos reais; leitura em voz alta',
    plan_a: 'Identificação correta',
    wa: 'Aula 1 — Nossa Cozinha',
    title_spanish: 'Nuestra Cocina',
    title_sareh: 'Nossa Cozinha',
    questions: [
      { 
        q: 'O que significa SPOON?', 
        type: 'mc', 
        opts: ['Colher', 'Garfo', 'Faca', 'Panela'] 
      }
    ],
    // Aqui no futuro adicionaremos: embed_afghan, embed_spanish, etc.
  },
  {
    id: 'u7', color: 'natural', sort_order: 1, title: 'Cores e Frutas', title_dari: 'Colors and Fruits', sub: 'Aula 2',
    icon3D: '/unit-icons/Aula 7 Cores e Frutas.png', iconOutline: '/unit-icons/Aula 7 Cores e Frutas-não iniciada.png',
    brief: 'Use frutas reais durante a aula.', plan_c: 'Cores e frutas em inglês', plan_h: 'Associar cores aos objetos', plan_e: 'Frutas reais; mímica', plan_a: 'Identificação correta', wa: 'Aula 2 — Cores e Frutas',
    title_spanish: 'Colores y Frutas', title_sareh: 'Cores e Frutas',
    questions: [{ q: 'Como se diz VERMELHO em inglês?', type: 'mc', opts: ['Red', 'Blue', 'Green', 'Yellow'] }]
  },
  {
    id: 'u8', color: 'natural', sort_order: 2, title: 'Números e Quantidade', title_dari: 'Numbers and Quantity', sub: 'Aula 3',
    icon3D: '/unit-icons/Aula 8 Números e Quantidade.png', iconOutline: '/unit-icons/Aula 8 Números e Quantidade-não iniciada.png',
    brief: 'Conte objetos reais na mesa.', plan_c: 'Números 1-10', plan_h: 'Contar até 10 em inglês', plan_e: 'Contagem física', plan_a: 'Contagem correta', wa: 'Aula 3 — Números',
    title_spanish: 'Números y Cantidad', title_sareh: 'Números e Quantidade',
    questions: [{ q: 'Como se diz 3 em inglês?', type: 'mc', opts: ['Three', 'One', 'Five', 'Ten'] }]
  },
  {
    id: 'u6', color: 'natural', sort_order: 3, title: 'Receita', title_dari: 'Recipe', sub: 'Aula 4',
    icon3D: '/unit-icons/aula-6.png', iconOutline: '/unit-icons/aula-6-off.png',
    brief: 'Deixe o aluno ser o professor hoje.', plan_c: 'Receita; verbos de instrução', plan_h: 'Produzir frases de instrução', plan_e: 'Inversão de papéis', plan_a: 'Produção oral de 1 frase', wa: 'Aula 4 — Receita',
    title_spanish: 'Receta', title_sareh: 'Receita',
    questions: [{ q: 'Qual prato você quer me ensinar hoje?', type: 'text' }]
  },
  {
    id: 'u4', color: 'natural', sort_order: 4, title: 'Inglês no Cotidiano', title_dari: 'Everyday English', sub: 'Aula 5',
    icon3D: '/unit-icons/aula-4.png', iconOutline: '/unit-icons/aula-4-off.png',
    brief: 'Use embalagens reais de produtos.', plan_c: 'Inglês no dia a dia', plan_h: 'Reconhecer palavras em embalagens', plan_e: 'Objetos reais', plan_a: 'Identificação de 1 palavra', wa: 'Aula 5 — Inglês no dia a dia',
    title_spanish: 'Inglés en lo Cotidiano', title_sareh: 'Inglês no Cotidiano',
    questions: [{ q: 'O que significa RICE?', type: 'mc', opts: ['Arroz', 'Feijão', 'Frango', 'Sal'] }]
  },
  {
    id: 'u3', color: 'natural', sort_order: 5, title: 'Apresentação Pessoal', title_dari: 'Personal Presentation', sub: 'Aula 6',
    icon3D: '/unit-icons/aula-3.png', iconOutline: '/unit-icons/aula-3-off.png',
    brief: 'Pratique: "My name is...".', plan_c: 'Apresentação pessoal', plan_h: 'Produzir frases simples sobre si', plan_e: 'Modelagem pelo mediador', plan_a: 'Produção oral correta', wa: 'Aula 6 — Apresentação',
    title_spanish: 'Presentación Personal', title_sareh: 'Apresentação Pessoal',
    questions: [{ q: 'O que significa MY NAME IS?', type: 'mc', opts: ['Meu nome é', 'Eu gosto', 'Eu tenho', 'Onde está'] }]
  },
  {
    id: 'u10', color: 'natural', sort_order: 6, title: 'Partes do Corpo', title_dari: 'Body Parts', sub: 'Aula 7',
    icon3D: '/unit-icons/Partes do Corpo.png', iconOutline: '/unit-icons/Partes do Corpo-não iniciada.png',
    brief: 'Brincadeira: "Touch your head".', plan_c: 'Partes do corpo', plan_h: 'Identificar partes do corpo', plan_e: 'Mímica e movimento', plan_a: 'Identificação correta', wa: 'Aula 7 — Corpo',
    title_spanish: 'Partes del Cuerpo', title_sareh: 'Partes do Corpo',
    questions: [{ q: 'Onde está seu NOSE?', type: 'mc', opts: ['Nariz', 'Olho', 'Boca', 'Orelha'] }]
  },
  {
    id: 'u9', color: 'natural', sort_order: 7, title: 'Minha Família', title_dari: 'My Family', sub: 'Aula 8',
    icon3D: '/unit-icons/Minha Família.png', iconOutline: '/unit-icons/Minha Família-não iniciada.png',
    brief: 'Use fotos da família do aluno.', plan_c: 'Membros da família', plan_h: 'Identificar membros da família', plan_e: 'Fotos reais', plan_a: 'Identificação correta', wa: 'Aula 8 — Família',
    title_spanish: 'Mi Familia', title_sareh: 'Minha Família',
    questions: [{ q: 'Como se diz MÃE em inglês?', type: 'mc', opts: ['Mother', 'Father', 'Sister', 'Brother'] }]
  },
  {
    id: 'u5', color: 'natural', sort_order: 8, title: 'Temas Digitais', title_dari: 'Digital Themes', sub: 'Aula 9',
    icon3D: '/unit-icons/aula-5.png', iconOutline: '/unit-icons/aula-5-off.png',
    brief: 'Use o celular real durante a atividade.', plan_c: 'Gêneros digitais; redes sociais', plan_h: 'Identificar STORY, LIKE, etc', plan_e: 'Celular real', plan_a: 'Identificação correta', wa: 'Aula 9 — Inglês no celular',
    title_spanish: 'Temas Digitales', title_sareh: 'Temas Digitais',
    questions: [{ q: 'O que é um STORY?', type: 'mc', opts: ['Foto/vídeo temporário', 'Mensagem', 'Seguir', 'Comentário'] }]
  },
  {
    id: 'u11', color: 'natural', sort_order: 9, title: 'Animais e Sons', title_dari: 'Animals and Sounds', sub: 'Aula 10',
    icon3D: '/unit-icons/Animais e Sons.png', iconOutline: '/unit-icons/Animais e Sons-não iniciada.png',
    brief: 'Imite os sons dos animais.', plan_c: 'Animais e sons', plan_h: 'Associar animal ao som em inglês', plan_e: 'Sons e mímicas', plan_a: 'Identificação correta', wa: 'Aula 10 — Animais',
    title_spanish: 'Animales y Sonidos', title_sareh: 'Animais e Sons',
    questions: [{ q: 'Como se diz CACHORRO em inglês?', type: 'mc', opts: ['Dog', 'Cat', 'Fish', 'Lion'] }]
  },
  {
    id: 'u2', color: 'natural', sort_order: 10, title: 'Compreensão Oral', title_dari: 'Listening Comprehension', sub: 'Aula 11',
    icon3D: '/unit-icons/aula-2.png', iconOutline: '/unit-icons/aula-2-off.png',
    brief: 'Repita as frases duas vezes.', plan_c: 'Escuta e compreensão', plan_h: 'Identificar palavras-chave ouvidas', plan_e: 'Leitura em voz alta', plan_a: 'Identificação correta', wa: 'Aula 11 — Escuta',
    title_spanish: 'Comprensión Oral', title_sareh: 'Compreensão Oral',
    questions: [{ q: 'Quem cozinha em "My MOTHER cooks"?', type: 'mc', opts: ['Mãe', 'Avó', 'Irmã', 'Tia'] }]
  },
  {
    id: 'u12', color: 'natural', sort_order: 11, title: 'Revisão do Módulo', title_dari: 'Module Review', sub: 'Aula 12',
    icon3D: '/unit-icons/aula-1.png', iconOutline: '/unit-icons/aula-1-off.png',
    brief: 'Celebrar o progresso do aluno.', plan_c: 'Revisão geral', plan_h: 'Recuperar termos aprendidos', plan_e: 'Celebração e conversa', plan_a: 'Participação ativa', wa: 'Aula 12 — Revisão',
    title_spanish: 'Revisión del Módulo', title_sareh: 'Revisão do Módulo',
    questions: [{ q: 'Qual foi sua palavra favorita deste módulo?', type: 'text' }]
  }
];
