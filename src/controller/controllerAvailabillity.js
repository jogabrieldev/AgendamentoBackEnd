import Availability from "../models/availability.js"
import User from "../models/user.js";

export const controllerAvailability  = {

  async registerAvailability(req, res) {
    try {
      const { horario, status, idUser } = req.body;

      console.log('corpo' , req.body)

      if (!horario || !status || !idUser) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
      }

      const user = await User.findByPk(idUser);
      if (!user) {
        return res.status(404).json({ message: 'Usuário (barbeiro) não encontrado' });
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
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'O campo status é obrigatório' });
    }

    const availability = await Availability.findByPk(id);

    if (!availability) {
      return res.status(404).json({ message: 'Disponibilidade não encontrada' });
    }

    availability.status = status;
    await availability.save();

    res.status(200).json({ success: true, message: 'Status atualizado com sucesso', availability });

  } catch (error) {
    console.error('Erro ao atualizar status da disponibilidade:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}

}