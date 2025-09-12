import dotenv from "dotenv";
dotenv.config();
import { Sequelize } from "sequelize";

let sequelize;

if (process.env.URL_DO_BANCO_DE_DADOS) {
  // 🚀 Produção (Railway) usando a URL completa
  sequelize = new Sequelize(process.env.URL_DO_BANCO_DE_DADOS, {
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, 
      },
    },
       pool: {
       max: 5,
       min: 0,
       acquire: 30000, 
      idle: 10000
    },
     retry: {
     max: 5 // tenta reconectar até 5 vezes
    }
  });
} else {
  // 💻 Desenvolvimento (local)
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      dialect: "postgres",
      logging: false,
    }
  );
}

export default sequelize;

