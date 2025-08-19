
import Availability from '../models/availability.js';
import Appointment from '../models/appointment.js';
import { sendMessage } from '../services/whatsappService.js';
import Client from '../models/client.js';
import Service from '../models/services.js';
import { Op } from 'sequelize';


export async function getDisponibilidadeDoDia(req, res) {
  try {
    const dataSelecionada = req.params.data; // "2025-07-14"

    // horários base
    const horariosBase = await Availability.findAll({
       where: { status: 'Disponível' }, // 👈 só horários que o cabeleireiro marcou como disponíveis
  attributes: ['idDispo', 'horario'],
  order: [['horario', 'ASC']]
    });

    // agendados naquele dia
    const agendados = await Appointment.findAll({
      where: {
        data: dataSelecionada,
        status: {
          [Op.in]: ['Agendado', 'Indisponível']
        }
      },
      attributes: ['horario']
    });

    const agendadosSet = new Set(agendados.map(a => a.horario));

    const resultado = horariosBase
  .filter(h => !agendadosSet.has(h.idDispo)) // exclui os que estão agendados
  .map(h => ({
    idDispo: h.idDispo,
    horario: h.horario
  }));

    return res.json(resultado);
  } catch (error) {
    console.error('Erro ao buscar horários do dia:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}


export async function getAppointments(req, res) {
  try {
    const agendados = await Appointment.findAll({
      where: { status: 'Agendado' }, // ou o status que você usa
      include: [
        {
          model: Client,
          attributes: ['name'] // campos que você precisa
        }
      ],
      order: [['data', 'DESC']], // ordena do mais recente para o mais antigo
      limit: 10 // se quiser limitar os últimos 10
    });

    return res.status(200).json({message:" Sucesso em buscar agendamentos" ,success:true ,  agendados:agendados});
  } catch (err) {
    console.error('Erro ao buscar agendamentos:', err);
    res.status(500).json({ error: 'Erro ao buscar agendamentos' });
  }
}


// POST /appointments
export async function createAppointment(req, res) {
  try {
    const { data, horario, idClient, idUser, idServi, preco, nota } = req.body;

    // Verificar se o horário está livre
    const existe = await Appointment.findOne({
      where: {
        data,
        horario,
        status: { [Op.in]: ['Agendado', 'Confirmado', 'Indisponivel'] }
      }
    });

    if (existe) {
      return res.status(400).json({ error: 'Horário já está reservado para esta data.' });
    }

    // Criar o agendamento
    const agendamento = await Appointment.create({
      data,
      horario,
      status: 'Agendado',
      idClient,
      idUser,
      idServi,
      preco,
      nota
    });

    if (!agendamento) {
      return res.status(500).json({ error: 'Erro ao criar agendamento' });
    }

    // Buscar cliente e serviço(s) para enviar mensagem
    const client = await Client.findByPk(idClient);
    const services = await Service.findAll({ where: { idServi } });

    const nomeServicos = services.map(s => s.name).join(', ');

    const message = `Olá, ${client.name}! 👋\nSeu agendamento foi realizado com sucesso.\n\nServiço(s): ${nomeServicos}\nData: ${data}\nHorário: ${horario}\n\nAguardamos você!`;

    console.log("Cliente agendamento" ,client.telefone)

    await sendMessage(client.telefone, message);

    return res.status(201).json({
      message: "Agendamento realizado com sucesso e mensagem enviada ao cliente!",
      agendamento
    });

  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

