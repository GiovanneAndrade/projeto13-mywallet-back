import db from '../database/db.js'

async function createentradaEsaida (req, res)  {
  const { authorization, nome, email } = req.headers
  const token = authorization?.replace("Bearer", "");
  const confirmaToken =  await db.collection("sessions").find({ token }).toArray()
  
  
  if (!confirmaToken){
    return res.status(401)
  } 
    try {
      db.collection('entradaEsaida').find({nome, email}).toArray().then(i =>{(i)
      res.send(i.slice(-5))
    });
    } catch (error) {
      res.status(500).send(error.message)
    }
}

export { createentradaEsaida }