import joi from 'joi';
import bcrypt from 'bcrypt';
import db from '../database/db.js'
 const cadastroUser = joi.object({
  nome: joi.string().required(),
  email: joi.string().required().email(),
  senha: joi.string().required().min(4),
  confirme: joi.string().required().min(4)
}); 

async  function createCadastro (req, res)  {
  if(req.body.senha !== req.body.confirme){
    return res.status(401).send("senhas não conferem")
  }
   const {nome, email} = req.body
   const senha = bcrypt.hashSync(req.body.senha, 10);
 
   const verificarCadastro =  await db.collection("cadastro").findOne({ email })
   if (verificarCadastro ){
    return res.status(401).send("Usuario já Possui Cadastro")
   } 
 
   const valiCadastro = cadastroUser.validate(req.body, {abortEarly: false})
   if(valiCadastro.error){
    const erro = valiCadastro.error.details.map((err) => err.message)
     return res.status(422).send(erro)
   }
   try {
    await db.collection('cadastro').insertOne({
       ...{ nome },
       ...{ email },
       ...{ senha }
     })
   } catch (error) {
     res.status(500).send(error.message)
   }
   res.sendStatus(201)
 }

 export { createCadastro }