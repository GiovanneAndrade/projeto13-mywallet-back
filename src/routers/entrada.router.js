import express  from 'express';
import * as entradaController from '../controllers/entrada.controller.js'

const router = express.Router();
router.post('/entrada', entradaController.createEntrada );

export default router;