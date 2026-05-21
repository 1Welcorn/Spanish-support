-- 1. CRIAÇÃO DAS TABELAS
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  stars INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS units (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  sub TEXT,
  color TEXT,
  sort_order INTEGER,
  brief TEXT,
  plan_c TEXT,
  plan_h TEXT,
  plan_e TEXT,
  plan_a TEXT,
  wa TEXT,
  embed_urls JSONB DEFAULT '[]'::jsonb,
  descriptors JSONB DEFAULT '[]'::jsonb,
  questions JSONB DEFAULT '[]'::jsonb,
  external_links JSONB DEFAULT '[]'::jsonb,
  vocabulary_list JSONB DEFAULT '[]'::jsonb,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  unit_id TEXT REFERENCES units(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started',
  score INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, unit_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  unit_id TEXT REFERENCES units(id) ON DELETE CASCADE,
  session_date TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  unit_id TEXT REFERENCES units(id) ON DELETE CASCADE,
  question_index INTEGER,
  answer_value TEXT,
  is_done BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, unit_id, question_index)
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. POLÍTICAS DE SEGURANÇA (Zerar e Recriar)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Limpeza de políticas anteriores para evitar duplicatas
DROP POLICY IF EXISTS "Usuário acessa próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Acesso Total Administradores" ON profiles;
DROP POLICY IF EXISTS "Leitura Pública Unidades" ON units;
DROP POLICY IF EXISTS "Acesso Total Administradores" ON units;
DROP POLICY IF EXISTS "Usuário acessa próprio progresso" ON student_progress;
DROP POLICY IF EXISTS "Acesso Total Administradores" ON student_progress;
DROP POLICY IF EXISTS "Usuário acessa próprias sessões" ON sessions;
DROP POLICY IF EXISTS "Acesso Total Administradores" ON sessions;
DROP POLICY IF EXISTS "Usuário acessa próprias respostas" ON answers;
DROP POLICY IF EXISTS "Acesso Total Administradores" ON answers;
DROP POLICY IF EXISTS "Leitura Pública Configurações" ON settings;
DROP POLICY IF EXISTS "Acesso Total Administradores" ON settings;

-- Perfis: Usuários leem e editam seu próprio perfil; Admins gerenciam tudo
CREATE POLICY "Usuário acessa próprio perfil" ON profiles 
  FOR ALL USING (auth.uid() = id);
CREATE POLICY "Acesso Total Administradores" ON profiles 
  FOR ALL USING (auth.jwt() ->> 'email' IN ('willians.souza@escola.pr.gov.br', 'f4330252301@gmail.com'));

-- Unidades: Leitura pública; Admins gerenciam tudo
CREATE POLICY "Leitura Pública Unidades" ON units 
  FOR SELECT USING (true);
CREATE POLICY "Acesso Total Administradores" ON units 
  FOR ALL USING (auth.jwt() ->> 'email' IN ('willians.souza@escola.pr.gov.br', 'f4330252301@gmail.com'));

-- Progresso do Estudante: Donos acessam seu próprio progresso; Admins gerenciam tudo
CREATE POLICY "Usuário acessa próprio progresso" ON student_progress 
  FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "Acesso Total Administradores" ON student_progress 
  FOR ALL USING (auth.jwt() ->> 'email' IN ('willians.souza@escola.pr.gov.br', 'f4330252301@gmail.com'));

-- Sessões: Donos acessam suas sessões; Admins gerenciam tudo
CREATE POLICY "Usuário acessa próprias sessões" ON sessions 
  FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "Acesso Total Administradores" ON sessions 
  FOR ALL USING (auth.jwt() ->> 'email' IN ('willians.souza@escola.pr.gov.br', 'f4330252301@gmail.com'));

-- Respostas: Donos acessam suas respostas; Admins gerenciam tudo
CREATE POLICY "Usuário acessa próprias respostas" ON answers 
  FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "Acesso Total Administradores" ON answers 
  FOR ALL USING (auth.jwt() ->> 'email' IN ('willians.souza@escola.pr.gov.br', 'f4330252301@gmail.com'));

-- Configurações: Leitura pública; Admins gerenciam tudo
CREATE POLICY "Leitura Pública Configurações" ON settings 
  FOR SELECT USING (true);
CREATE POLICY "Acesso Total Administradores" ON settings 
  FOR ALL USING (auth.jwt() ->> 'email' IN ('willians.souza@escola.pr.gov.br', 'f4330252301@gmail.com'));

-- 3. HABILITAR REALTIME
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END;
$$;

ALTER PUBLICATION supabase_realtime ADD TABLE units, sessions, answers, settings, profiles, student_progress;

-- 4. INSERIR CONFIGURAÇÕES
INSERT INTO settings (key, value) VALUES 
('admin_pin', '1234'),
('med_pin', '5678'),
('med_name', 'Willians Antoniazzi'),
('med_phone', '5543999567378'),
('student_email', 'ione.ribeiro@escola.pr.gov.br'),
('start_date', '05/02/2026'),
('medical_period', '05/02/2026 a 19/12/2026'),
('cid_code', 'G71.2 / J96.1')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 5. INSERIR UNIDADES INICIAIS
INSERT INTO units (id, title, sub, color, sort_order, brief, plan_c, plan_h, plan_e, plan_a, wa, descriptors, external_links, questions) VALUES 
('u1', 'Unidade 1 — Palavras da cozinha', 'Kitchen words · Aula 1 · 10 min', 'teal', 0, 'Antes de começar: vá à cozinha com ela e segure objetos reais. Diga o nome em inglês devagar.', 'Vocabulário da cozinha', 'Identificar palavras em inglês', 'Objetos reais', 'Apontamento correto', 'Oi! Aula 1...', '["D3", "D5"]', '[]', '[{"q":"O que significa SPOON?","type":"mc","opts":["Colher","Garfo","Faca","Panela"],"hint":"Diga SPOON.","mediator":"Use objeto real."}]'),
('u2', 'Unidade 2 — Escuta e família', 'Listening · Aula 11 · 10 min', 'blue', 1, 'Fale devagar. Repita DUAS vezes.', 'Compreensão oral', 'Identificar palavra-chave', 'Mediadora lê frases', 'Identificação correta', 'Oi! Aula 2...', '["D1", "D4"]', '[]', '[{"q":"Quem cozinha em \"My MOTHER cooks\"?","type":"mc","opts":["Mãe","Avó","Irmã","Tia"],"hint":"MOTHER é a chave."}]'),
('u3', 'Unidade 3 — Meu nome, eu gosto', 'Self-introduction · Aula 6 · 10 min', 'coral', 2, 'Apresentação pessoal.', 'Apresentação pessoal', 'Produzir frase simples', 'Modelagem', 'Produção oral', 'Oi! Aula 3...', '["D10"]', '[]', '[{"q":"MY NAME IS significa?","type":"mc","opts":["Meu nome é","Eu gosto"],"hint":"Conexão direta."}]'),
('u4', 'Unidade 4 — Inglês ao meu redor', 'English around us · Aula 5 · 10 min', 'purple', 3, 'Objetos reais.', 'Inglês no cotidiano', 'Reconhecer palavras', 'Objetos reais', 'Identificação', 'Oi! Aula 4...', '["D5"]', '[]', '[{"q":"O que significa RICE?","type":"mc","opts":["Arroz","Feijão","Frango","Sal"],"hint":"Aponte."}]'),
('u5', 'Unidade 5 — Inglês no celular', 'Digital English · Aula 9 · 10 min', 'pink', 4, 'Celular real.', 'Gêneros digitais', 'Vocabulário social', 'Navegação', 'Identificação', 'Oi! Aula 5...', '["D12"]', '[]', '[{"q":"O que é um STORY?","type":"mc","opts":["Foto/vídeo temporário","Mensagem","Seguir","Comentário"],"hint":"Ela já usa."}]'),
('u6', 'Unidade 6 — Minha receita em inglês', 'My recipe · Aula 4 · 15 min', 'amber', 5, 'Ela é a professora.', 'Receita', 'Instrução', 'Inversão', 'Frase completa', 'Oi! Aula 6...', '["D9"]', '[]', '[{"q":"Qual prato você quer me ensinar hoje?","type":"text","hint":"Translate.","mediator":"Willians Antoniazzi"}]')
ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title,
  sub = EXCLUDED.sub,
  color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order,
  brief = EXCLUDED.brief,
  plan_c = EXCLUDED.plan_c,
  plan_h = EXCLUDED.plan_h,
  plan_e = EXCLUDED.plan_e,
  plan_a = EXCLUDED.plan_a,
  wa = EXCLUDED.wa,
  embed_urls = EXCLUDED.embed_urls,
  descriptors = EXCLUDED.descriptors,
  external_links = EXCLUDED.external_links,
  questions = EXCLUDED.questions;
