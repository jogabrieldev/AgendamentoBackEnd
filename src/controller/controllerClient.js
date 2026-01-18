import Client from "../models/client.js";
import { v4 as uuidv4 } from "uuid";
import  jsonWebToken from "jsonwebtoken";
import Service from "../models/services.js";
import { normalizarTelefone } from "../utils/phone.js";
import { authenticateClient } from "../services/authenticateClientSystem.js";

const jwt = jsonWebToken

export const controllerClient = {
  async registerClient(req, res) {
    try {
      let { name, phone , email, password} = req.body
      const idUser = req.idUser;
      
      const clientData = await authenticateClient.authenticateClientRegister(name, phone , email, password, idUser)
     
      const tokenAcess = uuidv4();
      if(!tokenAcess){
         return res.status(400).json({message:"Erro para gerar token do cliente!"})
      }
      const newClient = await Client.create({
        ...clientData,
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
      const isValidationError = error.message && !error.message.includes('Sequelize');
      return res.status(isValidationError ? 400 : 500).json({
        success: false,
        message: error.message || "Erro interno no servidor"
      });
    }
  },

async validatePhoneClient(req, res) {
  try {
    const { phone } = req.params;

    if (!phone) {
      return res.status(400).json({ message: "Numero de telefone não foi passado!" });
    }

    // normaliza o telefone (para garantir que vem no formato certo, ex: com DDD)
    const normalized = normalizarTelefone(phone);

    if (!normalized) {
      return res.status(400).json({ message: "Telefone inválido!" });
    }

    // busca no cache ou banco
    const verifique = await getClientByPhone(normalized);

    if (!verifique) {
      return res.status(400).json({ message: "Numero não presente na nossa base!" });
    }


    return res.status(200).json({
      message: "Numero encontrado na nossa base",
      success: true,
      verifique
    });

  } catch (error) {
    console.error("❌ Erro em verificar o contato passado", error);
    return res.status(500).json({ message: "Erro no server para validar esse contato" });
  }
},


  async accessByToken(req, res) {
    const { uuid } = req.params;

    const client = await Client.findOne({ where: { tokenAcess: uuid } });

    if (!client) {
      return res.status(404).json({ message: "Acesso negado cliente não enontrado" });
    }

    const token = jwt.sign(
     { idUser: client.id, role: 'client' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
     );


     const service = await Service.findAll({
       where: { idUser: client.idUser }
    });


    return res.status(200).json({
      success: true,
      client: client,
      servico: service,
      token:token
    });
  },
};
