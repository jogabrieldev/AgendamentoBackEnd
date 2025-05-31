
import { DataTypes } from'sequelize';
import sequelize from'../config/database.js';

const Availability = sequelize.define('availability', {
  idDispo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  horario: {
    type: DataTypes.TIME,
    allowNull: false
  },
  status:{
    type: DataTypes.STRING(50),
    allowNull: false
  },
  
  idUser: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'user', // barbeiro
      key: 'idUser'
    },
    onDelete:'NO ACTION',
    onUpdate:'NO ACTION'
  }
}, {
  tableName: 'availability'
});

export default Availability