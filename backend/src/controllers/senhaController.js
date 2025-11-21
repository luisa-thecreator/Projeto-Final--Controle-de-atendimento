const SenhaModel = require('../models/senhaModel');
const GuicheModel = require('../models/guicheModel');

const SenhaController = {
  // POST /senhas/emitir - Emitir nova senha
  async emitir(req, res) {
    try {
      const { tipo } = req.body;
      if (!['SP', 'SG', 'SE'].includes(tipo)) {
        return res.status(400).json({ error: 'Tipo inválido. Use: SP, SG ou SE' });
      }
      const senha = await SenhaModel.emitir(tipo);
      res.status(201).json(senha);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // POST /senhas/chamar - Chamar próxima senha para um guichê
  async chamar(req, res) {
    try {
      const { guicheId, ultimoTipo } = req.body;

      const guiche = await GuicheModel.getById(guicheId);
      if (!guiche) {
        return res.status(404).json({ error: 'Guichê não encontrado' });
      }

      const proximaSenha = await SenhaModel.getProximaSenha(ultimoTipo || null);
      if (!proximaSenha) {
        return res.status(404).json({ error: 'Nenhuma senha na fila' });
      }

      const senha = await SenhaModel.chamar(proximaSenha.id, guicheId);
      res.json(senha);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // PUT /senhas/:id/iniciar - Iniciar atendimento
  async iniciarAtendimento(req, res) {
    try {
      const senha = await SenhaModel.iniciarAtendimento(req.params.id);
      res.json(senha);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // PUT /senhas/:id/finalizar - Finalizar atendimento
  async finalizarAtendimento(req, res) {
    try {
      const { tempoAtendimento } = req.body;
      const senha = await SenhaModel.finalizarAtendimento(req.params.id, tempoAtendimento);
      res.json(senha);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // PUT /senhas/:id/descartar - Descartar senha
  async descartar(req, res) {
    try {
      await SenhaModel.descartar(req.params.id);
      res.json({ message: 'Senha descartada' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // GET /senhas/painel - Últimas 5 senhas chamadas
  async painel(req, res) {
    try {
      const senhas = await SenhaModel.getUltimasChamadas();
      res.json(senhas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // GET /senhas/fila - Senhas aguardando
  async fila(req, res) {
    try {
      const senhas = await SenhaModel.getSenhasAguardando();
      res.json(senhas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // GET /senhas/guiche/:guicheId/atual - Buscar senha atual de um guichê
  async getSenhaAtualGuiche(req, res) {
    try {
      const senha = await SenhaModel.getSenhaAtualGuiche(req.params.guicheId);
      res.json(senha);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // GET /senhas/:id - Buscar senha por ID
  async getById(req, res) {
    try {
      const senha = await SenhaModel.getById(req.params.id);
      if (!senha) return res.status(404).json({ error: 'Senha não encontrada' });
      res.json(senha);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // GET /relatorios/diario/:data - Relatório diário
  async relatorioDiario(req, res) {
    try {
      const relatorio = await SenhaModel.getRelatorioDiario(req.params.data);
      res.json(relatorio);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // GET /relatorios/mensal/:ano/:mes - Relatório mensal
  async relatorioMensal(req, res) {
    try {
      const { ano, mes } = req.params;
      const relatorio = await SenhaModel.getRelatorioMensal(ano, mes);
      res.json(relatorio);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = SenhaController;
