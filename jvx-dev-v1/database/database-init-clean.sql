-- ============================================
-- JVX - Inicialização Limpa do Banco de Dados
-- Execute este script para criar um banco limpo
-- ============================================

-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS worksdb;

USE worksdb;

-- Remover tabelas existentes
DROP TABLE IF EXISTS works;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS developers;

-- ============================================
-- Tabela de Desenvolvedores
-- ============================================
CREATE TABLE developers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE COMMENT 'Nome do desenvolvedor',
  phone VARCHAR(20) COMMENT 'Telefone',
  email VARCHAR(100) COMMENT 'E-mail',
  whatsapp VARCHAR(20) COMMENT 'WhatsApp',
  pixKey VARCHAR(100) COMMENT 'Chave PIX',
  pixType VARCHAR(50) COMMENT 'Tipo de chave PIX',
  bankName VARCHAR(100) COMMENT 'Nome do banco',
  agency VARCHAR(20) COMMENT 'Agência',
  account VARCHAR(30) COMMENT 'Conta',
  observations TEXT COMMENT 'Observações sobre o desenvolvedor',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_developer_name ON developers(name);

-- ============================================
-- Tabela de Usuários
-- ============================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE COMMENT 'Nome de usuário único',
  password VARCHAR(255) NOT NULL COMMENT 'Senha criptografada (bcrypt ou SHA2 legado)',
  role ENUM('master', 'standard') NOT NULL DEFAULT 'standard' COMMENT 'Tipo de usuário',
  developer_name VARCHAR(100) COMMENT 'Nome do desenvolvedor associado (para usuários padrão)',
  active BOOLEAN DEFAULT TRUE COMMENT 'Usuário ativo/inativo',
  session_token VARCHAR(64) NULL COMMENT 'Token de sessão único — novo login invalida o anterior',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_username ON users(username);
CREATE INDEX idx_role ON users(role);
CREATE INDEX idx_user_developer_name ON users(developer_name);

-- Inserir usuário master padrão
-- Usuário: jvxadmin
-- Senha: admin123 (será migrado para bcrypt no primeiro login)
INSERT INTO users (username, password, role, developer_name, active) VALUES
('jvxadmin', SHA2('admin123', 256), 'master', NULL, TRUE);

-- ============================================
-- Tabela de Trabalhos/Projetos
-- ============================================
CREATE TABLE works (
  id INT AUTO_INCREMENT PRIMARY KEY,
  developer VARCHAR(100) NOT NULL COMMENT 'Nome do desenvolvedor responsável',
  deadline_type VARCHAR(50) NOT NULL DEFAULT 'Normal' COMMENT 'Tipo de prazo (Normal, Prazo Reduzido)',
  value DECIMAL(10, 2) NOT NULL COMMENT 'Valor do trabalho em R$',
  developer_status VARCHAR(50) NOT NULL DEFAULT 'Em Andamento' COMMENT 'Status do desenvolvedor (Em Andamento, Concluído)',
  completed_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Data e hora em que o projeto foi marcado como concluído',
  completed_by VARCHAR(100) NULL COMMENT 'Usuário que marcou o projeto como concluído',
  domain VARCHAR(255) NOT NULL COMMENT 'Domínio/URL do desenvolvimento',
  site_type VARCHAR(100) NOT NULL COMMENT 'Tipo de Site (Site Institucional, Landing Page, Site Corporativo, E-commerce, Blog, Portfólio)',
  template VARCHAR(500) COMMENT 'URL do template utilizado (ThemeForest, etc)',
  delivery_date DATE NOT NULL COMMENT 'Data de entrega/início',
  delivery_month VARCHAR(20) NOT NULL COMMENT 'Mês da entrega',
  delivery_year INT NOT NULL COMMENT 'Ano da entrega',
  status VARCHAR(50) NOT NULL DEFAULT 'Não Entregue' COMMENT 'Status (Entregue, Não Entregue)',
  payment_status VARCHAR(50) NOT NULL DEFAULT 'Não Pago' COMMENT 'Status do pagamento (Pago, Não Pago, Pendente)',
  observations TEXT COMMENT 'Observações sobre o projeto',

  -- Campos de Avaliação (sistema de rating)
  rating_aparencia TINYINT UNSIGNED NULL DEFAULT NULL COMMENT 'Avaliação de aparência (1-5)',
  rating_complexidade TINYINT UNSIGNED NULL DEFAULT NULL COMMENT 'Avaliação de complexidade (1-5)',
  rating_satisfacao TINYINT UNSIGNED NULL DEFAULT NULL COMMENT 'Avaliação de satisfação do cliente (1-5)',
  rating_material TINYINT UNSIGNED NULL DEFAULT NULL COMMENT 'Avaliação do material encaminhado (1-5)',
  rating_observacoes TEXT NULL COMMENT 'Observações sobre a avaliação',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para melhor performance
CREATE INDEX idx_developer ON works(developer);
CREATE INDEX idx_delivery_date ON works(delivery_date);
CREATE INDEX idx_status ON works(status);
CREATE INDEX idx_payment_status ON works(payment_status);
CREATE INDEX idx_delivery_year ON works(delivery_year);
CREATE INDEX idx_delivery_month ON works(delivery_month);
CREATE INDEX idx_developer_status ON works(developer_status);
CREATE INDEX idx_completed_by ON works(completed_by);

-- ============================================
-- Verificação
-- ============================================
SELECT 'Banco de dados criado com sucesso!' AS status;
SELECT 'Usuário master: jvxadmin | Senha: admin123' AS credenciais;
SELECT COUNT(*) AS total_works FROM works;
SELECT COUNT(*) AS total_developers FROM developers;
SELECT COUNT(*) AS total_users FROM users;
