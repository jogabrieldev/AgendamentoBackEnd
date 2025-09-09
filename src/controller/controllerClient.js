import Client from "../models/client.js";
import User from "../models/user.js";
import { v4 as uuidv4 } from "uuid";
import Service from "../models/services.js";
import { normalizarTelefone } from "../utils/phone.js";

export const controllerClient = {
  async registerClient(req, res) {
    try {
      let { name, phone , idUser , token} = req.body

      if (!name || !phone) {
        return res.status(404).json({ message: "Dados obrigatorios não passados" });
      }

      if(!idUser){
         idUser = 1
       }

       const telefone = normalizarTelefone(phone);

     
      const validPhone = await Client.findOne({where:{telefone: telefone}})
      
      if(validPhone){
        return res.status(422).json({message:"numero ja cadastrado no sistema"})
      }

      const tokenAcess = token || uuidv4();
      if(!tokenAcess){
         return res.status(400).json({message:"Erro para gerar token do cliente!"})
      }
      const newClient = await Client.create({
        name,
        telefone,
        dataCadastro: new Date(),
        idUser,
        tokenAcess
      });

      if (newClient) {
        return res
          .status(201)
          .json({
            success: true,
            message: "Cliente registrado com Sucesso",
            client: newClient,
          });
      }
    } catch (error) {
      console.error("Erro no controller client", error);
      return res.status(500).json({ message: "Erro no server para cadastrar cleinte" });
    }
  },

  async generateAccessLink(req, res) {
    const { numberClient } = req.params;
    console.log(numberClient)
    if(!numberClient){
       return res.status(400).json({message:"E preciso ser passado o numero so cliente"})
    }

    const client = await Client.findOne( {where: {telefone: numberClient}});
    

    if (!client) {
      return res.status(404).json({ message: "Cliente não encontrado" });
    }

    // Gera um token de acesso simples
    const tokenAcesso = uuidv4();

    // Armazena esse token na tabela Client (adicione esse campo no modelo)
    client.tokenAcess = tokenAcesso;
    await client.save();

    // Link de acesso (envie por WhatsApp, e-mail, etc.
    const link = `http://localhost:3000/client/acesso/${tokenAcesso}`;

    return res.status(200).json({ success: true, link });
  },

  async updateClientByToken(req, res) {
  const { token } = req.params;
  const { name, telefone } = req.body;

  try {
    const client = await Client.findOne({ where: { tokenAcess: token } });

    if (!client) {
      return res.status(404).json({ message: 'Token inválido ou expirado.' });
    }

    client.name = name;
    client.telefone = telefone;

    await client.save();

    return res.status(200).json({
      success: true,
      message: 'Cadastro finalizado com sucesso!',
      client
    });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return res.status(500).json({ message: 'Erro interno ao atualizar cliente.' });
  }
},

async  validatePhoneClient(req, res) {
        const {phone} = req.params
        try {
           if(!phone){
            return res.status(400).json({message:"Numero de telefone não foi passado!"})
           }
           
           const verifique =  await Client.findOne({where:{telefone: phone} })
           if(!verifique){
             return res.status(400).json({message:"Numero não presente na nosa base!"})
           }
           return res.status(200).json({message:"Numero encontrado na nossa base" , success:true , verifique})
        } catch (error) {
           console.error('Erro em verificar o contato passsado')
           return res.status(500).json({message:"Erro no server para validar esse contato"})
        }
},


  async accessByToken(req, res) {
    const { token } = req.params;

    const client = await Client.findOne({ where: { tokenAcess: token } });

    if (!client) {
      return res.status(404).json({ message: "Link inválido ou expirado" });
    }

    // let service = []

     const service = await Service.findAll({
       where: { idUser: client.idUser }
    });

    console.log(service)

    // Aqui você pode retornar os dados que o cliente pode acessar
    return res.status(200).json({
      success: true,
      client: client,
      servico: service
    });
  },
};
