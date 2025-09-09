import indisponible from "../models/indisponible.js";
import User from '../models/user.js'

export const controllerIndisponible = {
      
  async registerHoursAndDateIndisponible(req ,res){
      try {
        const {status , horario , dataIndisponivel ,idUser } = req.body

        if(!horario || !dataIndisponivel || !idUser){
        return res.status(400).json({message:"Não foi passado todos os dados necessarios" , success:false})
        }

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); 
       const dataReq = new Date(dataIndisponivel);

        if (dataReq < hoje) {
        return res.status(400).json({
         message: "A data informada não pode ser no passado",
         success: false
      });
     }

      const user = await User.findByPk(idUser);
        if (!user) {
         return res.status(404).json({ message: 'Usuário (barbeiro) não encontrado' });
        };

        const jaExiste = await indisponible.findOne({
        where: {
        idUser,
        horario,
        dataIndisponivel
       }
      });

       if (jaExiste) {
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
       });
              
      return res.status(201).json({message:'Horario registrado com indisponivel' , success:true , result})
    } catch (error) {
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