import { DataTypes } from'sequelize';
import sequelize from'../config/database.js';
import User from './user.js';
import Service from './services.js';
import Client from './client.js';

const Appointment = sequelize.define('appointment', {
  idAppointment: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  data: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  horario: {
    type: DataTypes.TIME,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Agendado' // ou agendado, concluído, cancelado
  },
  nota: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  preco: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  
  idClient: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Client,
      key: 'idClient'
    },
    onDelete:'NO ACTION',
    onUpdate:'NO ACTION'

  },
  idUser: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'idUser'
    },
    onUpdate:'NO ACTION',
    onDelete:'NO ACTION'
  },
  idServi: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Service,
      key: 'idServi'
    },
    onDelete:'NO ACTION',
    onUpdate:"CASCADE"
  },

}, {
  tableName: 'appointment'
});

export default Appointment