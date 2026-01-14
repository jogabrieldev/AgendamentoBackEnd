import Service from "../models/services.js";
import { authenticateServiceUser } from "../services/authenticateServiceUser.js";

export const controllerService = {
  
  async registerService(req, res) {
    const { name, descricao, duracao, price } = req.body;
    const userId = req.userId
    try {
      const serviceDate = await authenticateServiceUser.authenticateRegisterService(name, descricao, duracao, price, userId);
       
      const newService = await Service.create({...serviceDate});

      if (newService) {
        return  res.status(200).json({ success: true, service: newService });
      }
    } catch (error) {
      const isValidationError = error.message && !error.message.includes('Sequelize');
      return res.status(isValidationError ? 400 : 500).json({
        success: false,
        message: error.message || "Erro interno no servidor"
      });
    }
  },

 async getAllServices(req, res) {
    try {
     const userId = req.userId;
      const services = await Service.findAll({
        where:{
          idUser:userId
        } 
      });
      if(!services || services.length === 0){
       return res.status(404).json({ message: 'Nenhum serviço encontrado para este barbeiro' });
      }
      return res.status(200).json({ service: services });

    }  catch (error) {
     console.error('Erro ao buscar serviços:', error);
      return res.status(500).json({ message: 'Erro ao buscar serviços' });
    }
  },


  async updateService(req, res) {

    const { name, descricao, duracao, price} = req.body;
    const {id} = req.params;
    const userId = req.userId;
    try {
      const dadosValidados = await authenticateServiceUser.authenticateUpdadeService(id, name, descricao, duracao, price, userId);
    
     await Service.update(dadosValidados, { where: { idServi:id } });

      return res.status(200).json({
       success: true,
       message: 'Serviço atualizado com sucesso',
       service: dadosValidados
      });

    } catch (error) {
      const isValidationError = error.message && !error.message.includes('Sequelize');
      return res.status(isValidationError ? 400 : 500).json({
       success: false,
       message: error.message || "Erro interno no servidor"
      });
    }
  },


  async deleteService(req, res) {
    const { id } = req.params;

    try {
      if(!id)return res.status(400).json({message:"Codigo do serviço não foi passado"})

  
      const service = await Service.findByPk(id);

      if (!service) {
        return res.status(404).json({ message: "Serviço não encontrado" });
      }

      await service.destroy() 
      return  res.status(200).json({ success: true, message: "Serviço deletado com sucesso" });

    } catch (error) {
      console.error("Erro ao deletar serviço:", error);
      return res.status(500).json({ message: "Erro ao deletar serviço" });
    }
  },
};
