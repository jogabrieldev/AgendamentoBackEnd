
import sequelize from '../config/database.js'
import user from './user.js'
import Client from './client.js'
import Service from './services.js'
import Availability from './availability.js'
import Appointment from './appointment.js'
import indisponible from './indisponible.js'

const database = {
    sequelize,
    user,
    Service,
    Client,
    Availability,
    Appointment,
    indisponible
}
export default database