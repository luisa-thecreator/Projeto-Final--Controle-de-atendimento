const express = require('express');
const router = express.Router();
const SenhaController = require('../controllers/senhaController');

router.get('/diario/:data', SenhaController.relatorioDiario);
router.get('/mensal/:ano/:mes', SenhaController.relatorioMensal);

module.exports = router;
