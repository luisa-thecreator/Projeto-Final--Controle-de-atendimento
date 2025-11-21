const express = require('express');
const router = express.Router();
const GuicheController = require('../controllers/guicheController');

router.get('/', GuicheController.getAll);
router.get('/disponiveis', GuicheController.getDisponiveis);
router.post('/', GuicheController.create);
router.delete('/:id', GuicheController.delete);

module.exports = router;
