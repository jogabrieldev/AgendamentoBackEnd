import { DataTypes } from'sequelize';
import sequelize from'../config/database.js';
import User from './user.js';

const Service = sequelize.define('service', {
    idServi: {
    type: DataTypes.INTEGER,
    autoIncrement:true,
    primaryKey:true
    
  },
  name: {
    type: DataTypes.STRING(60),
    allowNull: false
  },
  descricao :{
     type: DataTypes.STRING(60),
     allowNull:false
  },
  
   duracao : {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
},
  idUser:{
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'idUser'
    },
    onDelete:'NO ACTION',
    onUpdate:'NO ACTION'
  }  

},{
  tableName: 'service'

});

export default  Service;