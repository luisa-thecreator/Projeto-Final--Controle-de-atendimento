const GuicheModel = require('../models/guicheModel');

const GuicheController = {
  async getAll(req, res) {
    try {
      const guiches = await GuicheModel.getAll();
      res.json(guiches);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getDisponiveis(req, res) {
    try {
      const guiches = await GuicheModel.getDisponiveis();
      res.json(guiches);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req, res) {
    try {
      const { numero } = req.body;
      const guiche = await GuicheModel.create(numero);
      res.status(201).json(guiche);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      await GuicheModel.delete(req.params.id);
      res.json({ message: 'Guichê removido' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = GuicheController;
