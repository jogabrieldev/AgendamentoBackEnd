import { DataTypes } from'sequelize';
import sequelize from'../config/database.js';


const User = sequelize.define('user', {
    idUser: {
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
  email: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },

  userCpf: {
    type: DataTypes.STRING(14),
    unique: true,
    allowNull: true
  },
  passwordHash: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  status: {
    type: DataTypes.TEXT(50),
    allowNull: false
  },
   telefone: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
}, {
  tableName: "user"
   
  
});

export default  User;
