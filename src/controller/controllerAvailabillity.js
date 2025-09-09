import Availability from "../models/availability.js"
import User from "../models/user.js";

export const controllerAvailability  = {

  async registerAvailability(req, res) {
    try {
      const { horario, bodyStatus, idUser } = req.body;
      
      if (!horario || !bodyStatus || !idUser) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
      }

      const user = await User.findByPk(idUser);
      if (!user) {
        return res.status(404).json({ message: 'Usuário (barbeiro) não encontrado' });
      }
      
      const status = bodyStatus

      const valoresValidos = ["Disponível", "Indisponível" , "Agendado" , "Confirmado"];
      if (!valoresValidos.includes(status)) {
       return res.status(402).json({
       message: "Valor de status é inválido",
       success: false
     });
    }
   
    const horariosValidos = ["07:00" , "08:00" , 
      "09:00" , "10:00" , "11:00" , "12:00" ,
       "13:00" , "14:00" , "15:00" , 
      "16:00" , "17:00", "18:00" , "19:00" , 
      "20:00" , "21:00"]
      
      const horarioLimpo = horario.trim()
      if(!horariosValidos.includes(horarioLimpo)){
         return res.status(402).json({message:"Valor passado como horario não e valido" , success:false})
      }

      const horarioExistente = await Availability.findOne({
      where: {
        idUser: idUser,
        horario: horario
      }
    });

    if (horarioExistente) {
      return res.status(409).json({
        success: false,
        message: 'Este horário já foi registrado para este usuário!'
      });
    }

      const novaDisponibilidade = await Availability.create({
        horario,
        status,
        idUser
      });

      res.status(201).json({success:true , disponivel: novaDisponibilidade});

    } catch (error) {
      console.error('Erro ao registrar disponibilidade:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  } ,
  
 async getAllAvailabillity(req, res) {
  try {
    const disponibilidade = await Availability.findAll({ raw: true });
 
    return res.status(200).json({ message: 'Success', horarios: disponibilidade });

  } catch (error) {
    console.error('Erro para pegar os dados de disponibilidade:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
},


  async updateAvailabilityStatus(req, res) {
  try {
    const { id } = req.params;
    const { horario, bodyStatus} = req.body;

    if (!bodyStatus) {
      return res.status(400).json({ message: 'O campo status é obrigatório' });
    }

    const status = bodyStatus
      
      const valoresValidos = ["Disponível", "Indisponível" , "Agendado" , "Confirmado"];
      if (!valoresValidos.includes(status)) {
       return res.status(402).json({
       message: "Valor de status é inválido",
       success: false
     });
    }


    const availability = await Availability.findByPk(id);

    if (!availability) {
      return res.status(404).json({ message: 'Disponibilidade não encontrada' });
    }

    availability.horario = horario !== undefined ? horario : hoursDisponivel.horario;
    availability.status = status !== undefined ? status : hoursDisponivel.status;

    await availability.save();

    res.status(200).json({ success: true, message: 'Status atualizado com sucesso', hours: availability});

  } catch (error) {
    console.error('Erro ao atualizar status da disponibilidade:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
},

 async deleteAvailability(req ,res){
      
 const  {id}  = req.params;

    try {
      const hoursDisponivel = await Availability.findOne({ where: { idDispo: id } });

      if (!hoursDisponivel) {
        return res.status(404).json({ message: "horario não encontrado" });
      }

      await hoursDisponivel.destroy();

      res
        .status(200)
        .json({ success: true, message: "Horario deletado com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar serviço:", error);
      res.status(500).json({ message: "Erro ao deletar serviço" });
    }
 }

}