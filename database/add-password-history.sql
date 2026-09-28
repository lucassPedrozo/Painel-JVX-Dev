-- ============================================
-- Tabelas do Gerador de Link para Senhas
-- Execute este script para adicionar as novas tabelas
-- ============================================

USE worksdb;

-- ============================================
-- Tabela de histórico de mensagens
-- ============================================
CREATE TABLE IF NOT EXISTS password_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  mensagem TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  fixada BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_timestamp (user_id, timestamp DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabela de auditoria de links gerados
-- ============================================
CREATE TABLE IF NOT EXISTS password_links_audit (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  username VARCHAR(50) NOT NULL,
  link_acesso VARCHAR(500) NOT NULL,
  login_compartilhado VARCHAR(255) NOT NULL,
  mensagem TEXT,
  tempo_expiracao VARCHAR(10),
  secret_key VARCHAR(100) NOT NULL,
  link_gerado VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_created (user_id, created_at DESC),
  INDEX idx_secret_key (secret_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar criação
SELECT 
  'password_history' as tabela,
  COUNT(*) as registros
FROM password_history
UNION ALL
SELECT 
  'password_links_audit' as tabela,
  COUNT(*) as registros
FROM password_links_audit;

SELECT 'Tabelas do Gerador de Senhas criadas com sucesso!' as status;
