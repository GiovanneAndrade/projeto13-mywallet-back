import express  from 'express';
import * as entradaEsaidaController from '../controllers/entradaEsaida.controller.js'

const router = express.Router();
router.get('/entradaEsaida', entradaEsaidaController.createentradaEsaida); 

export default router;
