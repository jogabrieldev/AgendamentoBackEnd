import dotenv from "dotenv";
dotenv.config();
import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME || process.env.PGDATABASE, // local usa DB_NAME, prod usa PGDATABASE
  process.env.DB_USER || process.env.PGUSER,     // local usa DB_USER, prod usa PGUSER
  process.env.DB_PASSWORD || process.env.PGPASSWORD,
  {
    host: process.env.DB_HOST || process.env.PGHOST,
    port: process.env.DB_PORT || process.env.PGPORT || 5432,
    dialect: "postgres",
    dialectOptions: {
      ssl: process.env.NODE_ENV === "production" ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    logging: false,
  }
);

export default sequelize;
