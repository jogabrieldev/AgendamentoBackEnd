import dotenv from "dotenv";
dotenv.config()
import { Sequelize } from "sequelize";

const sequelize = new Sequelize(process.env.DB_NAME , process.env.DB_USER ,process.env.DB_PASSWORD ,{
      
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false, 
})

export default sequelize