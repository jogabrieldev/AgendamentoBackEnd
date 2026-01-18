
import { where } from 'sequelize';
import Service from '../models/services.js';

export const authenticateServiceUser = {
   

    duracaoDefaultSystem(){
        return["10" , "15", "20", "25", "30", "35", "40", "45"
            , "50", "55" , "60" , "70", "80", "90", "100", "120"
        ]
    },

    async authenticateRegisterService(name ,descricao, duracao, price, userId){
        if(!name || !descricao || !duracao || !price || !userId){
            throw new Error("Algum campo obrigatorio não foi preechido")
        }

        const numericPrice = Number(price);

        if (isNaN(numericPrice)) {
        throw new Error("O preço deve ser um valor numérico válido");
       }

        if (numericPrice <= 0) {
         throw new Error("O preço deve ser um valor maior que zero");
        }

        const validDuracao = this.duracaoDefaultSystem();
        if(!validDuracao.includes(duracao)){
            throw new Error("Duração inválida para o serviço")
        }

        const valid = await Service.findOne({
            where:{
                name:name.trim(),
                idUser:userId
            }
        })
        if(valid){
            throw new Error("Serviço ja cadastrado para este usuario")
        }

        return {name, descricao: descricao.trim(), duracao, price: numericPrice, idUser:userId}
    },


    async authenticateUpdadeService(id, name ,descricao, duracao, price, userId){
        console.log("ID user" , userId , id)
       
        if (!id || !userId) {
         throw new Error("Informações de identificação ausentes.");
        }
        const serviceId = await Service.findByPk(id);
        if(!serviceId){
            throw new Error("ID do serviço não existe no sistema")
        }

        const service = await Service.findOne({
            where:{
               idServi:id,
               idUser:userId
            }
        })

         if(!service){
            throw new Error("Serviço não encontrado ou você não tem permissão para editá-lo.")
         }

        const updateData = {}

           if(name){
               const trimmedName = name.trim();
                if (trimmedName !== service.name) {
                  const nameExists = await Service.findOne({
                  where: { name: trimmedName, idUser: userId }
                  });
                  if (nameExists) throw new Error("Você já possui outro serviço com este nome.");
                }
              updateData.name = trimmedName;
            }
           
            if (descricao) {
              updateData.descricao = descricao.trim();
           }
             
            if (price !== undefined && price !== null) {
              const numericPrice = Number(price);
               if (isNaN(numericPrice) || numericPrice <= 0) {
                  throw new Error("O preço deve ser um valor numérico maior que zero.");
                }
               updateData.price = numericPrice;
            }

            if(duracao){
                const validDuracao = this.duracaoDefaultSystem();
                if(!validDuracao.includes(duracao)){
                  throw new Error("Duração inválida para o serviço")
                }
                updateData.duracao = duracao;
            }
            
           return updateData;
    }

}