import express  from 'express';
import * as  cadastroController from '../controllers/cadastro.controller.js' 


const router = express.Router();
router.post('/cadastro', cadastroController.createCadastro ); 

export default router;