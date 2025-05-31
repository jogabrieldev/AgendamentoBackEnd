import Service from "../models/services.js";

export const controllerService = {

   async registerService(req , res){
         const {name , descricao , duracao , price ,}= req.body
         try {
               if(!name || !descricao  || !duracao || !price){
                res.status(404).json({message: 'Algum campo Obrigatorio não foi preechido'})
               }

              const newService = await Service.create({ name,
                descricao,
                duracao,
                price})

                if(newService){
                    res.status(200).json({success: true ,  service:newService})
                }
         } catch (error) {
             console.error('Erro ao inserir service'  ,error)
             res.status(500).json({message:'Erro server'})
         }
    },

async deleteService(req, res) {
  const { id } = req.params;

  try {
    const service = await Service.findByPk(id);

    if (!service) {
      return res.status(404).json({ message: 'Serviço não encontrado' });
    }

    await service.destroy();

    res.status(200).json({ success: true, message: 'Serviço deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar serviço:', error);
    res.status(500).json({ message: 'Erro ao deletar serviço' });
  }
}

}