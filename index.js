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
app.use(cors({
   origin: "https://agendamento-vert.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,

}));

app.use(express.json())

app.use(router)

// try {
//   connectToWhatsApp();
// } catch (err) {
//   console.error("❌ Erro ao conectar ao WhatsApp:", err);
// }

const PORT = process.env.PORT || 3000;


const connectWithRetry = () => {
   dataBase.sequelize.authenticate()
    .then(() => {
      console.log('✅ Conectado ao banco');
      // continue com o resto da aplicação
    })
    .catch(err => {
      console.error('❌ Tentando reconectar...', err.message);
      setTimeout(connectWithRetry, 5000); // tenta novamente em 5 segundos
    });
};

connectWithRetry();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
})


  // dataBase.sequelize.authenticate()
 