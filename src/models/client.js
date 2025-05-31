import { DataTypes } from'sequelize';
import sequelize from'../config/database.js';


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
    type: DataTypes.TEXT(50),
    allowNull: false
  },

  tokenAcess:{
     type:DataTypes.STRING,
     allowNull: true
  },
  idUser: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'user', 
      key: 'idUser',
    }
}}, {
  tableName: "client"

  
});

export default  Client;