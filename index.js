import { MongoClient } from 'mongodb';
import express  from 'express';
import cors from 'cors';
import joi from 'joi';
import dayjs from "dayjs";
import dotenv from 'dotenv';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcrypt';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const dia = dayjs().format('DD/MM')

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

mongoClient.connect().then(() => {
  db = mongoClient.db('projeto13')
})  

 const cadastroUser = joi.object({
  nome: joi.string().required(),
  email: joi.string().required().email(),
  senha: joi.string().required().min(4),
  confirme: joi.string().required().min(4)
});

const cadastrarEntrada = joi.object({
  valor: joi.string().required(),
  descricao: joi.string().required().min(4)
}); 

const cadastrarSaida = joi.object({
  valor: joi.string().required(),
  descricao: joi.string().required().min(4)
}); 
 
app.post('/cadastro', async (req, res) => {
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
});

app.post('/login', async (req, res) => {
  const {email, senha} = req.body
  let nomeUser =  await db.collection("cadastro").findOne({ email })
   if (!nomeUser || !bcrypt.compareSync(senha, nomeUser.senha)){  
   return res.send(402);   
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
});

app.post('/entrada', async (req, res) => {
  const token = req.headers.token 
  const tipo = 'entrada'
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
});

app.post('/saida', async (req, res) => {
  const token = req.headers.token 
  const tipo = 'saida'
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
});

app.get('/entradaEsaida', async (req, res) => {
  const { nome, email, token } = req.headers
  let confirmaToken =  await db.collection("sessions").find({ token }).toArray()
  if (!confirmaToken){
    return res.status(401).send("Faça Login Novamente") 
  }
    try {
      db.collection('entradaEsaida').find({nome, email}).toArray().then(i =>{(i)
      res.send(i)
    });
    } catch (error) {
      res.status(500).send(error.message)
    }
});



app.get('/cadastro',  (req, res) => {
  const user = req.headers.user
   
    try {
      db.collection('cadastro').find({ }).toArray().then(i =>{(i)
      res.send(i)
    });
    } catch (error) {
      res.status(500).send(error.message)
    }
});

app.listen(5000, () => console.log('listening on port 5000'));