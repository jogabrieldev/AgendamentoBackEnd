import User from './user.js';
import Client from './client.js';
import Appointment from"./appointment.js"
import Service from './services.js';
import Availability from './availability.js';

User.hasMany(Client, { foreignKey: 'idUser' });
Client.belongsTo(User, { foreignKey: 'idUser' });

Appointment.belongsTo(Client, { foreignKey: 'idClient' });
Appointment.belongsTo(User, { foreignKey: 'idUser' });
Appointment.belongsTo(Service, { foreignKey: 'idServi' });

Client.hasMany(Appointment, { foreignKey: 'idClient' });
User.hasMany(Appointment, { foreignKey: 'idUser' });
Service.hasMany(Appointment, { foreignKey: 'idServi' });

Availability.belongsTo(User, { foreignKey: 'idUser' });
User.hasMany(Availability, { foreignKey: 'idUser' });


export { User, Client ,Appointment, Service, Availability };
