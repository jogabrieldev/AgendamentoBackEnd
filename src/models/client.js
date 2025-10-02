import { DataTypes } from'sequelize';
import sequelize from'../config/database.js';
import User from './user.js';


const Client = sequelize.define('client', {
    idClient: {
    type: DataTypes.INTEGER,
    autoIncrement:true,
    primaryKey:true
    
  },
  name: {
    type: DataTypes.STRING(60),
    allowNull: false
  },
  dataCadastro:{
     type: DataTypes.DATEONLY,
     allowNull:false
  },
  
   telefone: {
    type: DataTypes.STRING(12),
    allowNull: false,
    unique:true
  },

   email:{
     type: DataTypes.STRING(50),
     allowNull:false,
     unique:true
   },

  tokenAcess:{
     type:DataTypes.STRING,
     allowNull: false
  },
  idUser: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User, 
      key: 'idUser',
    },
    onDelete:'NO ACTION',
    onUpdate:'NO ACTION'
}}, {
  tableName: "client"

  
});

export default  Client;