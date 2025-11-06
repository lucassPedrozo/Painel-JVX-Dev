-- ============================================
-- Migração: Adicionar campo template
-- Execute este script se você já tem o banco criado
-- ============================================

USE worksdb;

-- Adicionar coluna template se não existir
ALTER TABLE works 
ADD COLUMN IF NOT EXISTS template VARCHAR(500) COMMENT 'URL do template utilizado (ThemeForest, etc)'
AFTER site_type;

-- Migrar dados de observations para template (URLs)
UPDATE works 
SET template = observations 
WHERE observations IS NOT NULL 
AND (observations LIKE 'http%' OR observations LIKE '%themeforest%' OR observations LIKE '%envato%');

-- Verificar se a coluna foi adicionada
DESCRIBE works;

SELECT 'Migração concluída com sucesso!' AS status;
