# Frontend - Sistema de Controle de Atendimento

Interface React para o sistema de controle de atendimento em laboratórios médicos.

## Requisitos

- Node.js 18+
- Backend rodando em `http://localhost:3001`

## Instalação

```bash
cd frontend
npm install
```

## Executando

**Desenvolvimento:**
```bash
npm run dev
```

O frontend iniciará em `http://localhost:5173`

**Build de Produção:**
```bash
npm run build
npm run preview
```

---

## Páginas do Sistema

### 1. Totem (`/`)
Tela para o cliente emitir senhas. Exibe três botões:
- **SP** - Senha Prioritária (idosos, gestantes, PCD)
- **SG** - Senha Geral
- **SE** - Retirada de Exames

Ao clicar, emite uma senha com código no formato `YYMMDD-PPSQ`.

### 2. Painel (`/painel`)
Exibe as últimas 5 senhas chamadas com:
- Código da senha
- Número do guichê
- Tipo (SP/SG/SE)

Atualiza automaticamente a cada 3 segundos.

### 3. Atendente (`/atendente`)
Painel para o atendente gerenciar o atendimento:
- Selecionar guichê
- Ver fila de espera por tipo
- Chamar próxima senha
- Iniciar/finalizar atendimento
- Descartar senha (cliente não compareceu)

### 4. Relatórios (`/relatorios`)
Consulta de relatórios diários e mensais:
- Total de senhas emitidas/atendidas
- Quantitativo por tipo
- Tempo médio de atendimento
- Detalhamento de cada senha

---

## Estrutura de Arquivos

```
frontend/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── pages/          # Páginas da aplicação
│   │   ├── Totem.jsx      # Emissão de senhas
│   │   ├── Painel.jsx     # Painel de chamadas
│   │   ├── Atendente.jsx  # Gestão do atendente
│   │   └── Relatorios.jsx # Relatórios
│   ├── services/
│   │   └── api.js      # Comunicação com backend
│   ├── App.jsx         # Componente principal
│   └── main.jsx        # Entry point
└── package.json
```

---

## Tipos de Senha

| Tipo | Cor | Descrição | Prioridade |
|------|-----|-----------|------------|
| SP | Vermelho | Prioritária | Alta |
| SE | Verde | Exames | Média |
| SG | Azul | Geral | Baixa |

## Fluxo de Atendimento

1. Cliente emite senha no **Totem**
2. Atendente chama próxima senha no **Painel do Atendente**
3. Senha aparece no **Painel** com número do guichê
4. Atendente inicia e finaliza o atendimento
5. Sistema registra tempo de atendimento

## Priorização

O sistema segue a ordem: `SP -> SE|SG -> SP -> SE|SG`

Sempre alterna entre senha prioritária e as demais.
