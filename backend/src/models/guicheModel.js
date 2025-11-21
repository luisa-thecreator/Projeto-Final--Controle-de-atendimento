const pool = require('../config/database');

const GuicheModel = {
  async getAll() {
    const [rows] = await pool.query('SELECT * FROM guiches ORDER BY numero');
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM guiches WHERE id = ?', [id]);
    return rows[0];
  },

  async getDisponiveis() {
    const [rows] = await pool.query("SELECT * FROM guiches WHERE status = 'disponivel' ORDER BY numero");
    return rows;
  },

  async setStatus(id, status) {
    await pool.query('UPDATE guiches SET status = ? WHERE id = ?', [status, id]);
    return this.getById(id);
  },

  async create(numero) {
    const [result] = await pool.query('INSERT INTO guiches (numero) VALUES (?)', [numero]);
    return { id: result.insertId, numero };
  },

  async delete(id) {
    await pool.query('DELETE FROM guiches WHERE id = ?', [id]);
  }
};

module.exports = GuicheModel;
