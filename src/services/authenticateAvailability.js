import Availability from "../models/availability.js";
import User from "../models/user.js";

export const authenticateAvailability = {
     
    statusDefault(){
        return ["Disponível", "Indisponível" , "Agendado" , "Confirmado"];
    },

    hoursValid(){
        return["07:00" , "08:00" , "09:00" , "10:00" , 
            "11:00" , "12:00" , "13:00" ,
            "14:00" , "15:00" , "16:00", "17:00", 
            "18:00", "19:00",
            "20:00", "21:00"
        ]
    },
    async authenticateRegisterAvailability(horario, bodyStatus, userId){
        if(!horario || !bodyStatus || !userId){
            throw new Error('Falta informações para cadastro da sua disponibilidade')
        }
        const status = bodyStatus

        const validValueStatus = this.statusDefault();
        if(!validValueStatus.includes(status)){
            throw new Error("valor de status e invalido")
        }
        const clearHours = horario.trim()
        const validHours = this.hoursValid();
        if(!validHours.includes(clearHours)){
            throw new Error("Valor passado como horario não e valido no sistema.")
        }

        const existingHours = await Availability.findOne({
            where:{
               idUser: userId,
               horario: horario
            }
        })

        if(existingHours){
            throw new Error("Este horario ja foi registrado para este usuario")
        }

        return {horario, status, idUser:userId};
    },

    async authenticateAvailabilityUpdate(id, horario, bodyStatus){
        if(!id || !horario || !bodyStatus){
            throw new Error("Falta informações para atualizar disponibilidade")
        }

        
        const status = this.statusDefault()
        if(!status.includes(bodyStatus)){
            throw new Error("Valor de status e invalido")
        }

        const clearHours = horario.trim();
        const validHours = this.hoursValid();
        if(!validHours.includes(clearHours)){
            throw new Error("Valor passado como horario não e valido no sistema ")
        }

        const availability = await Availability.findByPk(id)
        if(!availability){
            throw new Error("ID de disponibilidade não existe no sistema")
        }

        return { 
        availability, 
        newDate: { 
            horario: clearHours, 
            status: bodyStatus 
        }
       }
    }
}