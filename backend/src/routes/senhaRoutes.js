const express = require('express');
const router = express.Router();
const SenhaController = require('../controllers/senhaController');

router.post('/emitir', SenhaController.emitir);
router.post('/chamar', SenhaController.chamar);
router.get('/painel', SenhaController.painel);
router.get('/fila', SenhaController.fila);
router.get('/guiche/:guicheId/atual', SenhaController.getSenhaAtualGuiche);
router.get('/:id', SenhaController.getById);
router.put('/:id/iniciar', SenhaController.iniciarAtendimento);
router.put('/:id/finalizar', SenhaController.finalizarAtendimento);
router.put('/:id/descartar', SenhaController.descartar);

module.exports = router;
