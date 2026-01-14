import { where } from "sequelize";
import Availability from "../models/availability.js"
import User from "../models/user.js";
import { authenticateAvailability } from "../services/authenticateAvailability.js";

export const controllerAvailability  = {

  async registerAvailability(req, res) {
    try {
      const { horario, bodyStatus } = req.body;
      const userId = req.userId;

      const dateValid = await authenticateAvailability.authenticateRegisterAvailability(horario, bodyStatus , userId)
      const novaDisponibilidade = await Availability.create({...dateValid});

      if(novaDisponibilidade)  return res.status(201).json({success:true , disponivel: novaDisponibilidade});
  
    } catch (error) {
      const isValidationError = error.message && !error.message.includes('Sequelize');
      return res.status(isValidationError ? 400 : 500).json({
        success: false,
        message: error.message || "Erro interno no servidor"
      });
    }
  },
  
 async getAllAvailabillity(req, res) {
    try {
      const userId = req.userId;

      const disponibilidade = await Availability.findAll({ where:{idUser:userId} });
     if(disponibilidade) return res.status(200).json({ message: 'Success', horarios: disponibilidade });
    

    } catch (error) {
      console.error('Erro para pegar os dados de disponibilidade:', error);
      return res.status(500).json({ success: false, message: 'Erro no servidor para buscar disponibilidade' });
   }
  },


  async updateAvailabilityStatus(req, res) {
    try {
     const { id } = req.params;
     const { horario, bodyStatus} = req.body;
    
     const { availability, newDate } = await authenticateAvailability.authenticateAvailabilityUpdate(id, horario, bodyStatus);

      await availability.update({
        horario: newDate.horario,
        status:newDate.status
      });

     return res.status(200).json({ success: true, message: 'Status atualizado com sucesso', hours: availability});
    } catch (error) {
      console.error('Erro ao atualizar status da disponibilidade:', error);
      const isValidationError = error.message && !error.message.includes('Sequelize');
      return res.status(isValidationError ? 400 : 500).json({
        success: false,
        message: error.message || "Erro interno no servidor"
      });
    }
  },

  async deleteAvailability(req ,res){

    const  {id}  = req.params;
    const userId = req.userId;

    try {
      const hoursDisponivel = await Availability.findOne({
        where: {
          idDispo: id,
          idUser: userId
        } 
      });

      if (!hoursDisponivel) {
        return res.status(404).json({ message: "horario não encontrado" });
      }

      await hoursDisponivel.destroy();

      return res.status(200).json({ success: true, message: "Horario deletado com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar horario de disponibilidade:", error);
      return res.status(500).json({ message: "Erro ao deletar horario de disponibilidade" });
    }
  }

}