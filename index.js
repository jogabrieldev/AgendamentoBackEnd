import express from 'express'
import dataBase  from './src/models/initModels.js'
import './src/models/associations.js'
import router from './src/routes/routes.js'
import { connectToWhatsApp } from './src/services/whatsappService.js'
import cors from 'cors'

const app = express()

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:4200");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json())


app.use(cors({
  // origin: "http://localhost:4200",
  origin:["https://agendamento-vert.vercel.app/login"],
  methods: ["GET", "POST", "PUT", "DELETE"],
}));


app.use(router)

  connectToWhatsApp()


dataBase.sequelize.authenticate()
  .then(() => {
    console.log("✅ Conexão com o banco estabelecida com sucesso!");
    return dataBase.sequelize.sync({alter:true}); 
  })
  .then(() => {
    console.log("📦 Banco sincronizado");
    const PORT = process.env.PORT || 3000; // Railway fornece a porta via env
    app.listen(PORT, () => {
      console.log(`🚀 Server rodando na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Erro ao conectar com o banco:", error);
  });
  
  // app.listen(3000,()=>{
  //   console.log('Server running on port 3000')
  // })


