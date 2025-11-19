-- ============================================
-- Migração: Adicionar coluna completed_by
-- ============================================

USE worksdb;

-- Adicionar coluna completed_by se não existir
ALTER TABLE works 
ADD COLUMN IF NOT EXISTS completed_by VARCHAR(100) NULL 
COMMENT 'Usuário que marcou o projeto como concluído' 
AFTER completed_at;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_completed_by ON works(completed_by);

-- Verificação
SELECT 'Coluna completed_by adicionada com sucesso!' AS status;
DESCRIBE works;
