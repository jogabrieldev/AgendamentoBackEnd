
import { DataTypes } from'sequelize';
import sequelize from'../config/database.js';
import User from './user.js';

const Availability = sequelize.define('availability', {
  idDispo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  horario: {
    type: DataTypes.STRING(5),
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
      model: User, // barbeiro
      key: 'idUser'
    },
    onDelete:'NO ACTION',
    onUpdate:'NO ACTION'
  }
}, {
  tableName: 'availability'
});

export default Availability