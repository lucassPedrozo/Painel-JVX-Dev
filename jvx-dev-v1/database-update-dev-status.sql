-- Script para atualizar a estrutura do banco de dados
-- Adiciona campo para desenvolvedores marcarem conclusão

USE worksdb;

-- Adicionar novo campo para status do desenvolvedor
ALTER TABLE works ADD COLUMN developer_status ENUM('Em Andamento', 'Concluído') NOT NULL DEFAULT 'Em Andamento' AFTER status;

-- Adicionar índice para melhor performance
ALTER TABLE works ADD INDEX idx_developer_status (developer_status);

-- Comentários dos campos para documentação
ALTER TABLE works MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'Não Entregue' COMMENT 'Status de entrega controlado pelo master';
ALTER TABLE works MODIFY COLUMN developer_status ENUM('Em Andamento', 'Concluído') NOT NULL DEFAULT 'Em Andamento' COMMENT 'Status de conclusão controlado pelo desenvolvedor';
ALTER TABLE works MODIFY COLUMN payment_status VARCHAR(50) NOT NULL DEFAULT 'Não Pago' COMMENT 'Status de pagamento controlado pelo master';

-- Atualizar registros existentes baseado no status atual
UPDATE works SET developer_status = 'Concluído' WHERE status = 'Entregue';

SELECT 'Estrutura do banco atualizada com sucesso!' as message;