CREATE DATABASE IF NOT EXISTS controle_atendimento;
USE controle_atendimento;

-- Tabela de guichês
CREATE TABLE IF NOT EXISTS guiches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero INT NOT NULL UNIQUE,
  status ENUM('disponivel', 'ocupado') DEFAULT 'disponivel',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de senhas
CREATE TABLE IF NOT EXISTS senhas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(15) NOT NULL UNIQUE,
  tipo ENUM('SP', 'SG', 'SE') NOT NULL,
  sequencia INT NOT NULL,
  status ENUM('aguardando', 'chamada', 'em_atendimento', 'atendida', 'descartada') DEFAULT 'aguardando',
  guiche_id INT NULL,
  data_emissao DATETIME NOT NULL,
  data_chamada DATETIME NULL,
  data_inicio_atendimento DATETIME NULL,
  data_fim_atendimento DATETIME NULL,
  tempo_atendimento_minutos DECIMAL(5,2) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guiche_id) REFERENCES guiches(id)
);

-- Tabela de configuração do expediente
CREATE TABLE IF NOT EXISTS configuracao (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hora_inicio TIME DEFAULT '07:00:00',
  hora_fim TIME DEFAULT '17:00:00'
);

-- Inserir guichês padrão
INSERT IGNORE INTO guiches (numero) VALUES (1), (2), (3), (4), (5);

-- Inserir configuração padrão
INSERT INTO configuracao (hora_inicio, hora_fim)
SELECT '07:00:00', '17:00:00'
WHERE NOT EXISTS (SELECT 1 FROM configuracao);

-- Índices para performance
CREATE INDEX idx_senhas_status ON senhas(status);
CREATE INDEX idx_senhas_tipo ON senhas(tipo);
CREATE INDEX idx_senhas_data_emissao ON senhas(data_emissao);
