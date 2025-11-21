# Backend - Sistema de Controle de Atendimento

API REST para gerenciamento de senhas e atendimento em laboratórios médicos.

## Requisitos

- Node.js 18+
- MySQL 8.0

## Instalação

```bash
cd backend
npm install
```

## Configuração do Banco de Dados

1. Crie o arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

2. Edite o `.env` com suas credenciais:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=controle_atendimento
PORT=3001
```

3. Execute o schema SQL no MySQL:

```bash
mysql -u root -p < src/config/schema.sql
```

## Executando o Servidor

**Desenvolvimento:**
```bash
npm run dev
```

**Produção:**
```bash
npm start
```

O servidor iniciará em `http://localhost:3001`

---

## API Endpoints

### Senhas

#### Emitir Nova Senha
```bash
curl -X POST http://localhost:3001/api/senhas/emitir \
  -H "Content-Type: application/json" \
  -d '{"tipo": "SP"}'
```
Tipos: `SP` (Prioritária), `SG` (Geral), `SE` (Exames)

#### Chamar Próxima Senha
```bash
curl -X POST http://localhost:3001/api/senhas/chamar \
  -H "Content-Type: application/json" \
  -d '{"guicheId": 1, "ultimoTipo": "SP"}'
```

#### Ver Painel (Últimas 5 Chamadas)
```bash
curl http://localhost:3001/api/senhas/painel
```

#### Ver Fila de Espera
```bash
curl http://localhost:3001/api/senhas/fila
```

#### Buscar Senha por ID
```bash
curl http://localhost:3001/api/senhas/1
```

#### Iniciar Atendimento
```bash
curl -X PUT http://localhost:3001/api/senhas/1/iniciar
```

#### Finalizar Atendimento
```bash
curl -X PUT http://localhost:3001/api/senhas/1/finalizar \
  -H "Content-Type: application/json" \
  -d '{"tempoAtendimento": 5.5}'
```

#### Descartar Senha
```bash
curl -X PUT http://localhost:3001/api/senhas/1/descartar
```

---

### Guichês

#### Listar Todos os Guichês
```bash
curl http://localhost:3001/api/guiches
```

#### Listar Guichês Disponíveis
```bash
curl http://localhost:3001/api/guiches/disponiveis
```

#### Criar Guichê
```bash
curl -X POST http://localhost:3001/api/guiches \
  -H "Content-Type: application/json" \
  -d '{"numero": 6}'
```

#### Remover Guichê
```bash
curl -X DELETE http://localhost:3001/api/guiches/6
```

---

### Relatórios

#### Relatório Diário
```bash
curl http://localhost:3001/api/relatorios/diario/2025-11-21
```

#### Relatório Mensal
```bash
curl http://localhost:3001/api/relatorios/mensal/2025/11
```

---

## Tipos de Senha e Priorização

| Tipo | Descrição | TM Base | Variação |
|------|-----------|---------|----------|
| SP | Prioritária | 15 min | ±5 min |
| SG | Geral | 5 min | ±3 min |
| SE | Exames | <1 min | 95% 1min, 5% 5min |

**Ordem de chamada:** SP → SE|SG → SP → SE|SG

## Formato da Senha

`YYMMDD-PPSQ`

- `YY`: Ano (2 dígitos)
- `MM`: Mês (2 dígitos)
- `DD`: Dia (2 dígitos)
- `PP`: Tipo (SP, SG, SE)
- `SQ`: Sequência diária (3 dígitos)

Exemplo: `251121-SP001`
