import Appointment from '../models/appointment.js';
import { Op } from 'sequelize';
import Client from '../models/client.js';
import Service from '../models/services.js';
import { sendMessage } from '../services/whatsappService.js';

// GET /horarios-disponiveis/:data
export async function getAvailableTimes(req, res) {
  try {
    const data = req.params.data; 

    
    const agendados = await Appointment.findAll({
      where: {
        data,
        status: { [Op.in]: ['Agendado', 'Confirmado'] } // considerar status que bloqueiam horário
      },
      attributes: ['horario']
    });

    // Lista de horários reservados
    const horariosReservados = agendados.map(a => a.horario);

    // Exemplo simples: horários padrão fixos para o dia (você pode buscar de outro lugar)
    const horariosPadrao = [
      '08:00:00', '09:00:00', '10:00:00', '11:00:00',
      '13:00:00', '14:00:00', '15:00:00', '16:00:00', '17:00:00'
    ];

    // Filtra horários disponíveis removendo os reservados
    const disponiveis = horariosPadrao.filter(h => !horariosReservados.includes(h));

    return res.json(disponiveis);
  } catch (error) {
    console.error('Erro ao buscar horários disponíveis:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

// POST /appointments
export async function createAppointment(req, res) {
  try {
    const { data, horario, idClient, idUser, idServi, preco, nota } = req.body;

    console.log('respostas' , req.body)

    // Verificar se o horário está livre (não existe agendamento para data+horario)
    const existe = await Appointment.findOne({
      where: {
        data,
        horario,
        status: { [Op.in]: ['Agendado', 'Confirmado'] }
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
     const client = await Client.findByPk(idClient);
    const service = await Service.findByPk(idServi[0]); // ← assume 1 serviço

    if (client && service && client.telefone) {
      const mensagem = 
        `✅ *Agendamento Confirmado!*\n\n` +
        `👤 Cliente: *${client.name}*\n` +
        `💈 Serviço: *${service.name}*\n` +
        `📅 Data: *${data}*\n` +
        `⏰ Horário: *${horario}*\n\n` +
        `Nos vemos em breve!`;

      await sendMessage(client.telefone, mensagem);
      console.log('📤 Mensagem enviada para cliente:', client.telefone);
    }


    return res.status(201).json(agendamento);
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
