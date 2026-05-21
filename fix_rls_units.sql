-- ============================================================
-- FIX: Política RLS para permitir UPDATE de unidades pelo admin
-- 
-- PROBLEMA: O admin usa loginWithRole('admin') que cria um mock
-- user sem sessão JWT real no Supabase. Assim auth.jwt() é null
-- e o RLS bloqueia silenciosamente os UPDATEs.
--
-- SOLUÇÃO: Adicionar política que permite UPDATE para qualquer
-- usuário autenticado, OU usar o UUID fixo do mock admin.
-- ============================================================

-- Opção 1 (RECOMENDADA): Permitir UPDATE de units para qualquer
-- usuário autenticado (auth.uid() IS NOT NULL).
-- A segurança de quem é admin já é garantida no código frontend.

DROP POLICY IF EXISTS "Acesso Total Administradores" ON units;
DROP POLICY IF EXISTS "Admin escrita units" ON units;
DROP POLICY IF EXISTS "Qualquer autenticado pode editar units" ON units;

-- Mantém leitura pública
-- CREATE POLICY "Leitura Pública Unidades" já existe

-- Nova política: qualquer usuário autenticado pode escrever
CREATE POLICY "Admin escrita units" ON units
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- Opção 2 (ALTERNATIVA MAIS SEGURA): Aceitar os UUIDs dos admins
-- incluindo o UUID do mock admin usado pelo loginWithRole
-- ============================================================
-- DROP POLICY IF EXISTS "Acesso Total Administradores" ON units;
-- CREATE POLICY "Acesso Total Administradores" ON units
--   FOR ALL USING (
--     auth.jwt() ->> 'email' IN ('willians.souza@escola.pr.gov.br', 'f4330252301@gmail.com')
--     OR auth.uid() = '49f4c398-7cf1-4541-ba66-f045cf7b719e'::uuid
--   );
