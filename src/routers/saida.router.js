import express  from 'express';
import * as saidaController from '../controllers/saida.controller.js'

const router = express.Router();
router.post('/saida', saidaController.createSaida ); 

export default router;