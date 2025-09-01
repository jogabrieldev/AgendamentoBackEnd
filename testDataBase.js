// test-db.js
import dotenv from "dotenv";
dotenv.config();
import { Sequelize } from "sequelize";

async function testConnection(configName, dbName, user, password, options) {
  const sequelize = new Sequelize(dbName, user, password, options);

  try {
    await sequelize.authenticate();
    console.log(`✅ Conexão [${configName}] bem-sucedida!`);
  } catch (error) {
    console.error(`❌ Erro na conexão [${configName}]:`, error.message);
  } finally {
    await sequelize.close();
  }
}

(async () => {
  // LOCAL
  await testConnection("LOCAL",
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      dialect: "postgres",
      logging: false
    }
  );

  // NEON (PROD)
  await testConnection("NEON",
    process.env.PGDATABASE,
    process.env.PGUSER,
    process.env.PGPASSWORD,
    {
      host: process.env.PGHOST,
      port: process.env.PGPORT || 5432,
      dialect: "postgres",
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    }
  );
})();
