import { DataTypes } from'sequelize';
import sequelize from'../config/database.js';
import User from './user.js';


const indisponible = sequelize.define('availability', {
  idIndis: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  status:{
    type:DataTypes.TEXT,
     allowNull: false
  },

  horario:{
    type:DataTypes.TIME,
    allowNull:false
  },

  dataIndisponivel:{
    type:DataTypes.DATEONLY,
    allowNull:false
  } ,

   idUser: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User, // barbeiro
      key: 'idUser'
    },
    onDelete:'NO ACTION',
    onUpdate:'NO ACTION'
  },}, {
  tableName: 'indisponible'

})

export default indisponible