import joi from 'joi';
import dayjs from "dayjs";
import db from '../database/db.js'
const dia = dayjs().format('DD/MM')

const cadastrarEntrada = joi.object({
  valor: joi.string().required(),
  descricao: joi.string().required().min(4)
});

async function createEntrada (req, res)  {
  const { authorization } = req.headers
  const token = authorization?.replace("Bearer", "");
  const tipo = "entrada";
  const {valor, descricao, nome, email} = req.body

  let confirmaToken =  await db.collection("sessions").find({ token }).toArray()
  let confirmaUser =  await db.collection("cadastro").find({ email, nome}).toArray()
  
  if (!confirmaToken.length || !confirmaUser.length || !token){
    res.status(401).send('Faça Login Novamente')
    return;
  }
   const entradas = cadastrarEntrada.validate({descricao, valor}, {abortEarly: false})
  if(entradas.error){
   const erro = entradas.error.details.map((err) => err.message)
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

export {  createEntrada }