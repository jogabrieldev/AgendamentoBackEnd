import express from 'express'
import dataBase  from './src/models/initModels.js'
import './src/models/associations.js'
import router from './src/routes/routes.js'
// import { connectToWhatsApp } from './src/services/whatsappService.js'
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
  origin: "http://localhost:4200"
}));


app.use(router)

  // connectToWhatsApp()


dataBase.sequelize.authenticate()
  .then(() => {
    console.log("✅ Conexão com o banco estabelecida com sucesso!");
    return dataBase.sequelize.sync(); // Sincroniza models
  })
  .then(() => {
    console.log("📦 Banco sincronizado");
    app.listen(3000, () => {
      console.log("🚀 Server rodando na porta 3000");
    });
  })
  .catch((error) => {
    console.error("❌ Erro ao conectar com o banco:", error);
  });

