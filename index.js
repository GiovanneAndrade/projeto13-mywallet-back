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


const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

mongoClient.connect().then(() => {
  db = mongoClient.db('projeto13')
})  
 
app.post('/cadastro', async (req, res) => {
  const {nome, email} = req.body
  const senha = bcrypt.hashSync(req.body.senha, 10);
  try {
    db.collection('cadastro').insertOne({
      ...{ nome },
      ...{ email },
      ...{ senha }, 
    })
  } catch (error) {
    res.status(500).send(error.message)
  }
  res.sendStatus(201)
});

app.post('/login', async (req, res) => {
  const {email, senha} = req.body
  let nomeUser =  await db.collection("cadastro").findOne({ email})
   if (!nomeUser || !bcrypt.compareSync(senha, nomeUser.senha)){  
    res.send(402);   
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
      nomeUserId: nomeUser._id,
      token
    })
    if(retorno && token){
       delete retorno.senha
    }else {
      res.sendStatus(401);
    }
    res.send(retorno)
});

app.get('/cadastro',  (req, res) => {
  const user = req.headers.user
  console.log(user)
    try {
      db.collection('cadastro').find({ nome: user }).toArray().then(i =>{(i)
      res.send(i)
    });
    } catch (error) {
      res.status(500).send(error.message)
    }
});

app.listen(5000, () => console.log('listening on port 5000'));