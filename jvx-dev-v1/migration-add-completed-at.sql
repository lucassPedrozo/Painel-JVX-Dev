-- ============================================
-- Migração: Adicionar campo completed_at
-- Execute este script se você já tem o banco criado
-- ============================================

USE worksdb;

-- Adicionar coluna completed_at se não existir
ALTER TABLE works 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP NULL COMMENT 'Data e hora em que o projeto foi marcado como concluído'
AFTER developer_status;

-- Verificar se a coluna foi adicionada
DESCRIBE works;

SELECT 'Migração concluída com sucesso!' AS status;
