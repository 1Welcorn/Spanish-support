-- Execute este script no SQL Editor do Supabase (SQL Editor > New Query)
-- Ele adiciona todas as colunas novas que foram criadas no código mas que
-- ainda não existem no banco de dados.

ALTER TABLE units 
  ADD COLUMN IF NOT EXISTS title_dari TEXT,
  ADD COLUMN IF NOT EXISTS title_spanish TEXT,
  ADD COLUMN IF NOT EXISTS title_sareh TEXT,
  ADD COLUMN IF NOT EXISTS embed_preview_images JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS hide_nav BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS icon3D TEXT,
  ADD COLUMN IF NOT EXISTS iconOutline TEXT,
  ADD COLUMN IF NOT EXISTS game_words JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS learning_objectives TEXT,
  ADD COLUMN IF NOT EXISTS methodology TEXT,
  ADD COLUMN IF NOT EXISTS mystery_icon TEXT,
  ADD COLUMN IF NOT EXISTS mystery_icon_size INTEGER;
