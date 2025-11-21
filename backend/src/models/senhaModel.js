const pool = require('../config/database');

const SenhaModel = {
  // Gerar código da senha: YYMMDD-PPSQ
  gerarCodigo: (tipo, sequencia) => {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const sq = String(sequencia).padStart(3, '0');
    return `${yy}${mm}${dd}-${tipo}${sq}`;
  },

  // Buscar próxima sequência do dia para o tipo
  async getProximaSequencia(tipo) {
    const hoje = new Date().toISOString().split('T')[0];
    const [rows] = await pool.query(
      `SELECT MAX(sequencia) as max_seq FROM senhas
       WHERE tipo = ? AND DATE(data_emissao) = ?`,
      [tipo, hoje]
    );
    return (rows[0].max_seq || 0) + 1;
  },

  // Emitir nova senha
  async emitir(tipo) {
    const sequencia = await this.getProximaSequencia(tipo);
    const codigo = this.gerarCodigo(tipo, sequencia);
    const [result] = await pool.query(
      `INSERT INTO senhas (codigo, tipo, sequencia, data_emissao) VALUES (?, ?, ?, NOW())`,
      [codigo, tipo, sequencia]
    );
    return { id: result.insertId, codigo, tipo, sequencia };
  },

  // Buscar próxima senha seguindo priorização
  async getProximaSenha(ultimoTipo) {
    let tiposBusca = [];

    // Lógica: SP -> SE|SG -> SP -> SE|SG
    if (ultimoTipo === 'SP') {
      tiposBusca = ['SE', 'SG'];
    } else {
      tiposBusca = ['SP', 'SE', 'SG'];
    }

    for (const tipo of tiposBusca) {
      const [rows] = await pool.query(
        `SELECT * FROM senhas WHERE tipo = ? AND status = 'aguardando'
         ORDER BY data_emissao ASC LIMIT 1`,
        [tipo]
      );
      if (rows.length > 0) return rows[0];
    }
    return null;
  },

  // Chamar senha para guichê
  async chamar(senhaId, guicheId) {
    await pool.query(
      `UPDATE senhas SET status = 'chamada', guiche_id = ?, data_chamada = NOW() WHERE id = ?`,
      [guicheId, senhaId]
    );
    await pool.query(`UPDATE guiches SET status = 'ocupado' WHERE id = ?`, [guicheId]);
    return this.getById(senhaId);
  },

  // Iniciar atendimento
  async iniciarAtendimento(senhaId) {
    await pool.query(
      `UPDATE senhas SET status = 'em_atendimento', data_inicio_atendimento = NOW() WHERE id = ?`,
      [senhaId]
    );
    return this.getById(senhaId);
  },

  // Finalizar atendimento
  async finalizarAtendimento(senhaId, tempoAtendimento) {
    const [senha] = await pool.query(`SELECT guiche_id FROM senhas WHERE id = ?`, [senhaId]);

    await pool.query(
      `UPDATE senhas SET status = 'atendida', data_fim_atendimento = NOW(),
       tempo_atendimento_minutos = ? WHERE id = ?`,
      [tempoAtendimento, senhaId]
    );

    if (senha[0]?.guiche_id) {
      await pool.query(`UPDATE guiches SET status = 'disponivel' WHERE id = ?`, [senha[0].guiche_id]);
    }
    return this.getById(senhaId);
  },

  // Descartar senha
  async descartar(senhaId) {
    const [senha] = await pool.query(`SELECT guiche_id FROM senhas WHERE id = ?`, [senhaId]);

    await pool.query(`UPDATE senhas SET status = 'descartada' WHERE id = ?`, [senhaId]);

    if (senha[0]?.guiche_id) {
      await pool.query(`UPDATE guiches SET status = 'disponivel' WHERE id = ?`, [senha[0].guiche_id]);
    }
  },

  // Buscar senha por ID
  async getById(id) {
    const [rows] = await pool.query(
      `SELECT s.*, g.numero as guiche_numero FROM senhas s
       LEFT JOIN guiches g ON s.guiche_id = g.id WHERE s.id = ?`,
      [id]
    );
    return rows[0];
  },

  // Buscar últimas 5 senhas chamadas
  async getUltimasChamadas() {
    const [rows] = await pool.query(
      `SELECT s.*, g.numero as guiche_numero FROM senhas s
       LEFT JOIN guiches g ON s.guiche_id = g.id
       WHERE s.status IN ('chamada', 'em_atendimento', 'atendida') AND s.data_chamada IS NOT NULL
       ORDER BY s.data_chamada DESC LIMIT 5`
    );
    return rows;
  },

  // Buscar senhas aguardando
  async getSenhasAguardando() {
    const [rows] = await pool.query(
      `SELECT * FROM senhas WHERE status = 'aguardando' ORDER BY tipo, data_emissao`
    );
    return rows;
  },

  // Buscar todas senhas do dia
  async getSenhasDia(data) {
    const [rows] = await pool.query(
      `SELECT s.*, g.numero as guiche_numero FROM senhas s
       LEFT JOIN guiches g ON s.guiche_id = g.id
       WHERE DATE(s.data_emissao) = ? ORDER BY s.data_emissao`,
      [data]
    );
    return rows;
  },

  // Relatório diário
  async getRelatorioDiario(data) {
    const [total] = await pool.query(
      `SELECT COUNT(*) as total FROM senhas WHERE DATE(data_emissao) = ?`, [data]
    );
    const [atendidas] = await pool.query(
      `SELECT COUNT(*) as total FROM senhas WHERE DATE(data_emissao) = ? AND status = 'atendida'`, [data]
    );
    const [porTipo] = await pool.query(
      `SELECT tipo, COUNT(*) as emitidas,
       SUM(CASE WHEN status = 'atendida' THEN 1 ELSE 0 END) as atendidas
       FROM senhas WHERE DATE(data_emissao) = ? GROUP BY tipo`, [data]
    );
    const [tempoMedio] = await pool.query(
      `SELECT tipo, AVG(tempo_atendimento_minutos) as tm
       FROM senhas WHERE DATE(data_emissao) = ? AND status = 'atendida' GROUP BY tipo`, [data]
    );
    const senhas = await this.getSenhasDia(data);

    return {
      data,
      totalEmitidas: total[0].total,
      totalAtendidas: atendidas[0].total,
      porTipo,
      tempoMedio,
      senhasDetalhadas: senhas
    };
  },

  // Relatório mensal
  async getRelatorioMensal(ano, mes) {
    const [total] = await pool.query(
      `SELECT COUNT(*) as total FROM senhas WHERE YEAR(data_emissao) = ? AND MONTH(data_emissao) = ?`,
      [ano, mes]
    );
    const [atendidas] = await pool.query(
      `SELECT COUNT(*) as total FROM senhas WHERE YEAR(data_emissao) = ? AND MONTH(data_emissao) = ? AND status = 'atendida'`,
      [ano, mes]
    );
    const [porTipo] = await pool.query(
      `SELECT tipo, COUNT(*) as emitidas,
       SUM(CASE WHEN status = 'atendida' THEN 1 ELSE 0 END) as atendidas
       FROM senhas WHERE YEAR(data_emissao) = ? AND MONTH(data_emissao) = ? GROUP BY tipo`,
      [ano, mes]
    );
    const [tempoMedio] = await pool.query(
      `SELECT tipo, AVG(tempo_atendimento_minutos) as tm
       FROM senhas WHERE YEAR(data_emissao) = ? AND MONTH(data_emissao) = ? AND status = 'atendida' GROUP BY tipo`,
      [ano, mes]
    );
    const [porDia] = await pool.query(
      `SELECT DATE(data_emissao) as data, COUNT(*) as emitidas,
       SUM(CASE WHEN status = 'atendida' THEN 1 ELSE 0 END) as atendidas
       FROM senhas WHERE YEAR(data_emissao) = ? AND MONTH(data_emissao) = ?
       GROUP BY DATE(data_emissao) ORDER BY data`,
      [ano, mes]
    );

    return {
      ano,
      mes,
      totalEmitidas: total[0].total,
      totalAtendidas: atendidas[0].total,
      porTipo,
      tempoMedio,
      porDia
    };
  },

  // Reset diário das senhas não atendidas (descarte ao fim do expediente)
  async descartarSenhasPendentes() {
    await pool.query(
      `UPDATE senhas SET status = 'descartada' WHERE status = 'aguardando' AND DATE(data_emissao) < CURDATE()`
    );
  },

  // Buscar senha atual (chamada ou em_atendimento) de um guichê
  async getSenhaAtualGuiche(guicheId) {
    const [rows] = await pool.query(
      `SELECT s.*, g.numero as guiche_numero FROM senhas s
       LEFT JOIN guiches g ON s.guiche_id = g.id
       WHERE s.guiche_id = ? AND s.status IN ('chamada', 'em_atendimento')
       ORDER BY s.data_chamada DESC LIMIT 1`,
      [guicheId]
    );
    return rows[0] || null;
  }
};

module.exports = SenhaModel;
