import express from 'express'
import dataBase  from './src/models/initModels.js'
import './src/models/associations.js'
import router from './src/routes/routes.js'
import cors from 'cors'

const app = express()

const allowedOrigins = [
  "http://localhost:4200", 
  "https://agendamento-rouge-rho.vercel.app" 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS bloqueado para essa origem: " + origin));
    }
  },
   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
   credentials: true,
}));

app.use(express.json())
app.use(router)

// quando quiser recriar {force:true}
//quando quiser atualizar {alter:true}

const createTableDataBase = () => {
  dataBase.sequelize.sync() 
    .then(() => {
      console.log('✅ Conectado ao banco e tabelas sincronizadas');
    })
    .catch(err => {
      console.error('❌ Erro ao conectar/sincronizar:', err.message);
    });
};
createTableDataBase()


const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(` Server roading in port:${PORT}`);
})


 