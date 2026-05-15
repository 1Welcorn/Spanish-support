import type { Unit } from './types';

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
  {id:'u1',color:'natural',sort_order:0,title:'Nuestra cocina',title_dari:'Kitchen Vocabulary',sub:'Clase 1',
   icon3D: '/unit-icons/aula-1.png', iconOutline: '/unit-icons/aula-1-off.png',
   brief:'Antes de empezar: ve a la cocina con él/ella y sostén objetos reales. Di el nombre en inglés lentamente.',
   plan_c:'Vocabulario de la cocina; palabras-objeto',plan_h:'Identificar palabras en inglés por contexto',plan_e:'Objetos reales; lectura en voz alta',plan_a:'Señalamiento correcto',wa:'Clase 1 — Nuestra cocina',questions:[{q:'¿Qué significa SPOON?',type:'mc',opts:['Cuchara','Tenedor','Cuchillo','Olla']}]},
  
  {id:'u7',color:'natural',sort_order:1,title:'Colores y Frutas',title_dari:'Colors and Fruits',sub:'Clase 2',
   icon3D: '/unit-icons/Aula 7 Cores e Frutas.png', iconOutline: '/unit-icons/Aula 7 Cores e Frutas-não iniciada.png',
   brief:'Usa frutas reales.',plan_c:'Colores y frutas',plan_h:'Asociar colores a objetos',plan_e:'Frutas reales',plan_a:'Identificación correcta',wa:'Clase 2 — Colores y Frutas',questions:[{q:'¿Cómo se dice ROJO en inglés?',type:'mc',opts:['Red','Blue','Green','Yellow']}]},
  
  {id:'u8',color:'natural',sort_order:2,title:'Números y Cantidad',title_dari:'Numbers and Quantity',sub:'Clase 3',
   icon3D: '/unit-icons/Aula 8 Números e Quantidade.png', iconOutline: '/unit-icons/Aula 8 Números e Quantidade-não iniciada.png',
   brief:'Cuenta objetos en la mesa.',plan_c:'Numbers 1-10',plan_h:'Contar hasta 10',plan_e:'Conteo físico',plan_a:'Conteo correcto',wa:'Clase 3 — Números',questions:[{q:'¿Cómo se dice 3 en inglés?',type:'mc',opts:['Three','One','Five','Ten']}]},
  
  {id:'u6',color:'natural',sort_order:3,title:'Receta',title_dari:'Recipe',sub:'Clase 4',
   icon3D: '/unit-icons/aula-6.png', iconOutline: '/unit-icons/aula-6-off.png',
   brief:'Él/Ella es el profesor(a) hoy.',plan_c:'Receta; verbos de instrucción',plan_h:'Producir frase instruccional',plan_e:'Inversión de rol',plan_a:'1 frase completa',wa:'Clase 4 — Receta',questions:[{q:'¿Qué plato me quieres enseñar hoy?',type:'text'}]},
  
  {id:'u4',color:'natural',sort_order:4,title:'Inglés Cotidiano',title_dari:'English in Daily Life',sub:'Clase 5',
   icon3D: '/unit-icons/aula-4.png', iconOutline: '/unit-icons/aula-4-off.png',
   brief:'Separa envases reales.',plan_c:'Inglés en lo cotidiano',plan_h:'Reconocer palabras',plan_e:'Envases reales',plan_a:'Identificación de 1 palabra',wa:'Clase 5 — Inglés en el día a día',questions:[{q:'¿Qué significa RICE?',type:'mc',opts:['Arroz','Frijoles','Pollo','Sal']}]},
  
  {id:'u3',color:'natural',sort_order:5,title:'Presentación Personal',title_dari:'Personal Presentation',sub:'Clase 6',
   icon3D: '/unit-icons/aula-3.png', iconOutline: '/unit-icons/aula-3-off.png',
   brief:'"My name is...".',plan_c:'Presentación personal',plan_h:'Producir frase simple',plan_e:'El mediador modela',plan_a:'Producción oral',wa:'Clase 6 — Presentación',questions:[{q:'¿Qué significa MY NAME IS?',type:'mc',opts:['Mi nombre es','Me gusta','Yo tengo','Dónde está']}]},
  
  {id:'u10',color:'natural',sort_order:6,title:'Partes del Cuerpo',title_dari:'Body Parts',sub:'Clase 7',
   icon3D: '/unit-icons/Partes do Corpo.png', iconOutline: '/unit-icons/Partes do Corpo-não iniciada.png',
   brief:'Touch your head.',plan_c:'Partes del cuerpo',plan_h:'Identificar partes',plan_e:'Mímica',plan_a:'Identificación correcta',wa:'Clase 7 — Cuerpo',questions:[{q:'¿Dónde está tu NOSE?',type:'mc',opts:['Nariz','Ojo','Boca','Oreja']}]},
  
  {id:'u9',color:'natural',sort_order:7,title:'Mi Familia',title_dari:'My Family',sub:'Clase 8',
   icon3D: '/unit-icons/Minha Família.png', iconOutline: '/unit-icons/Minha Família-não iniciada.png',
   brief:'Usa fotos de la familia.',plan_c:'Miembros de la familia',plan_h:'Identificar miembros',plan_e:'Fotos reales',plan_a:'Identificación correcta',wa:'Clase 8 — Familia',questions:[{q:'¿Cómo se dice MADRE en inglés?',type:'mc',opts:['Mother','Father','Sister','Brother']}]},
  
  {id:'u5',color:'natural',sort_order:8,title:'Temas Digitales',title_dari:'Digital Genres',sub:'Clase 9',
   icon3D: '/unit-icons/aula-5.png', iconOutline: '/unit-icons/aula-5-off.png',
   brief:'Usa el celular REAL.',plan_c:'Géneros digitales',plan_h:'Identificar STORY, LIKE',plan_e:'Celular real',plan_a:'Identificación correcta',wa:'Clase 9 — Inglés en el celular',questions:[{q:'¿Qué es una STORY?',type:'mc',opts:['Foto/video temporal','Mensaje','Seguir','Comentario']}]},

  {id:'u11',color:'natural',sort_order:9,title:'Animales y Sonidos',title_dari:'Animals and Sounds',sub:'Clase 10',
   icon3D: '/unit-icons/Animais e Sons.png', iconOutline: '/unit-icons/Animais e Sons-não iniciada.png',
   brief:'Imita los sonidos de los animales.',plan_c:'Animales y sonidos',plan_h:'Asociar animal al sonido',plan_e:'Sonidos y mímicas',plan_a:'Identificación correcta',wa:'Clase 10 — Animales',questions:[{q:'¿Cómo se dice PERRO en inglés?',type:'mc',opts:['Dog','Cat','Fish','Lion']}]},

  {id:'u2',color:'natural',sort_order:10,title:'Comprensión Oral',title_dari:'Oral Comprehension',sub:'Clase 11',
   icon3D: '/unit-icons/aula-2.png', iconOutline: '/unit-icons/aula-2-off.png',
   brief:'Repite DOS veces.',plan_c:'Comprensión oral',plan_h:'Identificar palabra clave',plan_e:'Lectura en voz alta',plan_a:'Identificación correcta',wa:'Clase 11 — Escucha en inglés',questions:[{q:'¿Quién cocina en "My MOTHER cooks"?',type:'mc',opts:['Madre','Abuela','Hermana','Tía']}]},
  
  {id:'u12',color:'natural',sort_order:11,title:'Revisión del módulo',title_dari:'Module Review',sub:'Clase 12',
   icon3D: '/unit-icons/aula-1.png', iconOutline: '/unit-icons/aula-1-off.png',
   brief:'Celebrar el progreso.',plan_c:'Revisión general',plan_h:'Recuperar términos',plan_e:'Celebración',plan_a:'Participación activa',wa:'Clase 12 — Revisión',questions:[{q:'¿Cuál es tu palabra favorita?',type:'text'}]}
];
