import indisponible from "../models/indisponible.js";
import User from '../models/user.js'
import Appointment from "../models/appointment.js";
import sequelize from "../config/database.js";

export const controllerIndisponible = {
      
  async registerHoursAndDateIndisponible(req ,res){

    const transaction = await sequelize.transaction()
      try {
        const {status , horario , dataIndisponivel ,idUser } = req.body

        console.log("Corpo" , req.body)

        if(!horario || !dataIndisponivel || !idUser){
         await transaction.rollback()
        return res.status(400).json({message:"Não foi passado todos os dados necessarios" , success:false})
        }

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); 
       const dataReq = new Date(dataIndisponivel);

        if (dataReq < hoje) {
        
        await transaction.rollback()
        return res.status(400).json({
         message: "A data informada não pode ser no passado",
         success: false
      });
     }

      const user = await User.findByPk(idUser);
        if (!user) {
          await transaction.rollback();
         return res.status(404).json({ message: 'Usuário (barbeiro) não encontrado' });
        };

        const agendamentoExistente = await Appointment.findOne({
          where:{
          idUser,
          horario,
          data: dataIndisponivel,
          status: 'Agendado'
        },
        lock:transaction.LOCK.UPDATE,
        transaction:transaction
      });

       if (agendamentoExistente) {
        await transaction.rollback()
        return res.status(400).json({
        message: "Esse horário já possui um agendamento ativo (Agendado), não pode ser marcado como indisponível.",
        success: false
      });
     }

        const jaExiste = await indisponible.findOne({
        where: {
        idUser,
        horario,
        dataIndisponivel
       },
       lock:transaction.LOCK.UPDATE,
       transaction: transaction
      });

       if (jaExiste) {
        await transaction.rollback();
        return res.status(400).json({
        message: "Esse horário já foi marcado como indisponível para essa data",
        success: false
       });
     }
     
        const result = await indisponible.create({
          status,
          horario,
         dataIndisponivel,
         idUser
       }, {transaction:transaction});
       await transaction.commit()
              
      return res.status(201).json({message:'Horario registrado com indisponivel' , success:true , result})
    } catch (error) {
      await transaction.roolback()
      console.error('Erro para registrar horario e data indisponivel' , error)
     return res.status(500).json({message:"Erro no server para registrar horario indisponivel"})
     };
   },
  
async getHoursAndDateIndisponible(req, res) {
  try {
    const { idUser } = req.params;

    if (!idUser) {
      return res.status(400).json({ 
        message: 'Não foi passado o id do usuário. Verifique por favor.', 
        success: false 
      });
    }

    const Indisponible = await indisponible.findAll({
      where: { idUser },
      raw: true
    });

    return res.status(200).json({ 
      message: 'Success', 
      success: true,
      horarios: Indisponible 
    });

  } catch (error) {
    console.error('Erro para pegar os dados de disponibilidade:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro no servidor' 
    });
  }
}

}