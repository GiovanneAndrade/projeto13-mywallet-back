import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import db from '../database/db.js'
async function createLogin (req, res)  {
  const {email, senha} = req.body
  
  let nomeUser =  await db.collection("cadastro").findOne({ email })
   if (!nomeUser || !bcrypt.compareSync(senha, nomeUser.senha)){  
   return res.status(402).send("usuario ou senha invalido");  
  } 
  
  try {   
    db.collection('login').insertOne({
      ...req.body
    }) 
    
  } catch (error) { 
    res.status(500).send(error.message)
  }
    const token = uuid();
    let retorno = {...nomeUser, ...{token}} 
     await db.collection("sessions").insertOne({  
      //nomeUserId: nomeUser._id,
      token
    })
    if(retorno && token){
       delete retorno.senha
    }else {
      res.sendStatus(401);
    }
    res.send(retorno)
}

export { createLogin } 