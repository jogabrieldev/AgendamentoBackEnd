import Service from "../models/services.js";

export const controllerService = {
  
  async registerService(req, res) {
    const { name, descricao, duracao, price, idUser } = req.body;

    // console.log("corpo service", req.body);
    try {
      if (!name || !duracao || !price || !idUser) {
        res
          .status(404)
          .json({ message: "Algum campo Obrigatorio não foi preechido" });
      }

      const existingService = await Service.findOne({
        where: {
          name: name,
          idUser: idUser,
        },
      });

      if (existingService) {
        return res
          .status(409)
          .json({
            message: "Serviço com este nome já cadastrado para este usuário.",
          });
      }

      const newService = await Service.create({
        name,
        descricao,
        duracao,
        price,
        idUser,
      });

      if (newService) {
        res.status(200).json({ success: true, service: newService });
      }
    } catch (error) {
      console.error("Erro ao inserir service", error);
      res.status(500).json({ message: "Erro server" });
    }
  },

  async getAllServicesId(req, res) {
  try {
    const { barberId } = req.query;  // ← pegar o filtro opcional via query string

    let where = {};
    if (barberId) {
      where.idUser = barberId;
    }

    const services = await Service.findAll({ where });

    res.status(200).json({ service: services });

  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    res.status(500).json({ message: 'Erro ao buscar serviços' });
  }
},


  async getAllServices(req, res) {
     
    try {
      const { barberId } = req.query;

      let where = {};

      if (barberId) {
        where.idUser = barberId;  // Filtra pelos serviços do barbeiro
      }

      const services = await Service.findAll({ where });

      res.status(200).json({ service: services });
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      res.status(500).json({ message: 'Erro ao buscar serviços' });
    }
  },
  

 async updateService(req, res) {
  try {
    const { id } = req.params;
    const { name, descricao, duracao, price } = req.body;

    const service = await Service.findByPk(id);

    if (!service) {
      return res.status(404).json({ message: 'Serviço não encontrado' });
    }

    // Atualiza os campos recebidos
    service.name = name;
    service.descricao = descricao;
    service.duracao = duracao;
    service.price = price;

    await service.save();

    res.status(200).json({
      success: true,
      message: 'Serviço atualizado com sucesso',
      service: service
    });

  } catch (error) {
    console.error('Erro ao atualizar o serviço:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
},


  async deleteService(req, res) {
    const { id } = req.params;

    try {
      const service = await Service.findByPk(id);

      if (!service) {
        return res.status(404).json({ message: "Serviço não encontrado" });
      }

      await service.destroy();

      res
        .status(200)
        .json({ success: true, message: "Serviço deletado com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar serviço:", error);
      res.status(500).json({ message: "Erro ao deletar serviço" });
    }
  },
};
