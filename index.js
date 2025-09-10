import express from 'express'
import dataBase  from './src/models/initModels.js'
import './src/models/associations.js'
import router from './src/routes/routes.js'
import { connectToWhatsApp } from './src/services/whatsappService.js'
import cors from 'cors'

const app = express()


const allowedOrigins = [
  "http://localhost:4200", 
  "https://agendamento-vert.vercel.app" 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS bloqueado para essa origem: " + origin));
    }
  },
   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
   credentials: true,
}));

app.use(express.json())
app.use(router)

const connectWithRetry = () => {
   dataBase.sequelize.authenticate()
    .then(() => {
      console.log('✅ Conectado ao banco');
    })
    .catch(err => {
      console.error(' Tentando reconectar...', err.message);
      setTimeout(connectWithRetry, 5000); // tenta novamente em 5 segundos
    });
};

connectWithRetry();

(async () => {
  try {
    await connectToWhatsApp();
    console.log("📱 Serviço WhatsApp inicializado");
  } catch (err) {
    console.error(" Erro ao conectar ao WhatsApp:", err);
  }
})();

// process.on("unhandledRejection", (reason) => {
//   console.error(" Unhandled Rejection:", reason);
// });

// process.on("uncaughtException", (err) => {
//   console.error(" Uncaught Exception:", err);
// });



const PORT = process.env.PORT || 3000;




app.listen(PORT, "0.0.0.0", () => {
  console.log(` Server roading in port:${PORT}`);
})


  // dataBase.sequelize.authenticate()
 