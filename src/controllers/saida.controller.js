import joi from 'joi';
import dayjs from "dayjs";
import db from '../database/db.js'
const dia = dayjs().format('DD/MM')
const cadastrarSaida = joi.object({
  valor: joi.string().required(),
  descricao: joi.string().required().min(4)
}); 

async function createSaida (req, res) {
  const { authorization } = req.headers
  const token = authorization?.replace("Bearer", "");
  const tipo = "saida";
  const {valor, descricao, nome, email} = req.body

 
  let confirmaToken =  await db.collection("sessions").find({ token }).toArray()
  let confirmaUser =  await db.collection("cadastro").find({ email, nome}).toArray()
  
  if (!confirmaToken.length || !confirmaUser.length || !token){
    res.status(401).send('Faça Login Novamente')
    return;
  }

  const saidas = cadastrarSaida.validate({descricao, valor}, {abortEarly: false})
  if(saidas.error){
   const erro = saidas.error.details.map((err) => err.message)
    return res.status(422).send(erro)
  }

  try {
    await db.collection('entradaEsaida').insertOne({
      ...{ valor },
      ...{ descricao },    
      ...{ tipo }, 
      ...{ nome },
      ...{ email },
      ...{ dia }
    })
  } catch (error) {
    res.status(500).send(error.message)
  }
  res.sendStatus(201)
}

export { createSaida }