import Client from "../models/client.js";
import User from "../models/user.js";
import { v4 as uuidv4 } from "uuid";
import Service from "../models/services.js";

export const controllerClient = {
  async registerClient(req, res) {
    try {
      const { name, telefone , idUser } = req.body;
      // const idUser = req.userId;

      console.log('corpo' , req.body)

      if (!name || !telefone || !idUser) {
        return res.status(404).json({ message: "Dados obrigatorios não passados" });
      }

      const newClient = await Client.create({
        name,
        telefone,
        dataCadastro: new Date(),
        idUser,
      });

      if (newClient) {
        res
          .status(201)
          .json({
            success: true,
            message: "Cliente registrado com Sucesso",
            client: newClient,
          });
      }
    } catch (error) {
      console.error("Erro no controller client", error);
      res.status(500).json({ message: "Erro no server" });
    }
  },

  async generateAccessLink(req, res) {
    const { idClient } = req.params;

    const client = await Client.findByPk(idClient);
    console.log("cliente", client);
    if (!client) {
      return res.status(404).json({ message: "Cliente não encontrado" });
    }

    console.log("token", uuidv4());

    // Gera um token de acesso simples
    const tokenAcesso = uuidv4();

    // Armazena esse token na tabela Client (adicione esse campo no modelo)
    client.tokenAcess = tokenAcesso;
    await client.save();

    // Link de acesso (envie por WhatsApp, e-mail, etc.
    const link = `http://localhost:3000/client/acesso/${tokenAcesso}`;

    res.status(200).json({ success: true, link });
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

    res.status(200).json({
      success: true,
      message: 'Cadastro finalizado com sucesso!',
      client
    });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ message: 'Erro interno ao atualizar cliente.' });
  }
},


  async accessByToken(req, res) {
    const { token } = req.params;

    const client = await Client.findOne({ where: { tokenAcess: token } });

    if (!client) {
      return res.status(404).json({ message: "Link inválido ou expirado" });
    }

    let service = []

     if (client.name && client.telefone) {
      service = await Service.findAll({
      where: { idUser: client.idUser }
    });
  }
    // Aqui você pode retornar os dados que o cliente pode acessar
    res.status(200).json({
      success: true,
      client: client,
      servico: service
    });
  },
};
