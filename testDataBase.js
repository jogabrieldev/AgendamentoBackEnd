// test-db.js
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.URL_DO_BANCO_DE_DADOS, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

sequelize.authenticate()
  .then(() => console.log('✅ Conexão bem-sucedida'))
  .catch(err => console.error('❌ Erro na conexão:', err.message));