import db from './database/db.js'
import express  from 'express';
import cors from 'cors';
import cadastroRouter from './routers/cadastro.router.js'
import loginRouter from './routers/login.router.js'
import entradaRouter from './routers/entrada.router.js'
import saidaRouter from './routers/saida.router.js'
import entradaEsaidaRouter from './routers/entradaEsaida.router.js'

const app = express();
app.use(cors());
app.use(express.json());

app.use(cadastroRouter);
app.use(loginRouter);
app.use(entradaRouter);
app.use(saidaRouter);
app.use(entradaEsaidaRouter);


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