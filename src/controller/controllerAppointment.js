
import Availability from '../models/availability.js';
import Appointment from '../models/appointment.js';
import { sendMessage } from '../services/whatsappService.js';
import Client from '../models/client.js';
import Service from '../models/services.js';
import indisponible from '../models/indisponible.js';
import { Op } from 'sequelize';
import{formatToWhatsAppJid} from "../utils/phone.js"

export async function getDisponibilidadeDoDia(req, res) {
  try {
    const dataSelecionada = req.params.data;

    if (!dataSelecionada) {
      return res.status(400).json({
        success: false,
        message: "É necessário passar uma data para buscar horários disponíveis."
      });
    }

    const dataInput = new Date(dataSelecionada + "T00:00:00");
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); 

    if (isNaN(dataInput.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Data inválida. Use o formato YYYY-MM-DD."
      });
    }

    if (dataInput < hoje) {
      return res.status(400).json({
        success: false,
        message: "Não é permitido buscar disponibilidade para datas passadas."
      });
    }


    const horariosBase = await Availability.findAll({
      where: { status: 'Disponível' },
      attributes: ['idDispo', 'horario'],
      order: [['horario', 'ASC']]
    });

 
    const agendados = await Appointment.findAll({
      where: {
        data: dataSelecionada,
        status: { [Op.in]: ['Agendado', 'Indisponível'] }
      },
      attributes: ['horario']
    });

    const agendadosSet = new Set(agendados.map(a => a.horario.slice(0,5)));

 
    const indisponiveis = await indisponible.findAll({
      where: { dataIndisponivel: dataSelecionada },
      attributes: ['horario']
    });

    const indisponiveisSet = new Set(indisponiveis.map(i => i.horario.slice(0,5)));

    const agora = new Date();
     const resultado = horariosBase
      .filter(h => {
        const horarioStr = h.horario.slice(0, 5); 

   
        if (agendadosSet.has(horarioStr) || indisponiveisSet.has(horarioStr)) {
          return false;
        }

       
        const isHoje = dataInput.toDateString() === hoje.toDateString();
        if (isHoje) {
          const [hora, minuto] = horarioStr.split(':').map(Number);
          const horarioDate = new Date();
          horarioDate.setHours(hora, minuto, 0, 0);

          // Somente horários **maiores que o atual** estarão disponíveis
          if (horarioDate <= agora) {
            return false;
          }
        }

        return true;
      })
      .map(h => ({
        idDispo: h.idDispo,
        horario: h.horario
      }));

    return res.status(200).json(resultado);

  } catch (error) {
    console.error('Erro ao buscar horários do dia:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}



export async function getAppointments(req, res) {
  try {
    const agendados = await Appointment.findAll({
      where: { status: 'Agendado' }, 
      include: [
        {
          model: Client,
          attributes: ['name']
        }
      ],
      order: [['data', 'DESC']], 
      limit: 10 
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

    // Normaliza a data recebida
    const hoje = new Date();
    hoje.setHours(0,0,0,0); // zera hora, minutos, segundos
    const partes = data.split('-').map(Number); // YYYY-MM-DD
    const dataAgendamento = new Date(partes[0], partes[1] - 1, partes[2]);
   
    console.log("hoje" , hoje)
    console.log("data" , dataAgendamento)



    // Validação 1: não permite datas passadas
    if (dataAgendamento < hoje) {
      return res.status(400).json({ error: 'Não é possível agendar para datas passadas.' });
    }

    // Validação 2: não permite domingos
    if (dataAgendamento.getDay() === 0) { // 0 = domingo
      return res.status(400).json({ error: 'Não é permitido agendar aos domingos.' });
    }

    // Validação 3: não permite horários passados na data de hoje
    if (dataAgendamento.getTime() === hoje.getTime()) {
      const [hora, minuto] = horario.split(':').map(Number);
      const agora = new Date();
      if (hora < agora.getHours() || (hora === agora.getHours() && minuto <= agora.getMinutes())) {
        return res.status(400).json({ error: 'Não é permitido agendar horários já passados para hoje.' });
      }
    }

    // Validação 4: horário já reservado
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

    // Criação do agendamento
    const agendamento = await Appointment.create({
      data,
      horario,
      status: 'Agendado',
      idClient,
      idUser,
      idServi: Array.isArray(idServi) ? idServi : [idServi],
      preco,
      nota
    });

    if (!agendamento) {
      return res.status(500).json({ error: 'Erro ao criar agendamento' });
    }

    // Preparar mensagem para o cliente
    const client = await Client.findByPk(idClient);
    const services = await Service.findAll({
      where: { idServi: { [Op.in]: agendamento.idServi } }
    });

    const nomeServicos = services.map(s => s.name).join(', ');

    const message = `Olá, ${client.name}! 👋\nSeu agendamento foi realizado com sucesso.\n\nServiço(s): ${nomeServicos}\nData: ${data}\nHorário: ${horario}\n\nAguardamos você!`;

    console.log("Cliente agendamento", client.telefone);
    const clientJid = formatToWhatsAppJid(client.telefone);

    await sendMessage(clientJid, message);

    return res.status(201).json({
      message: "Agendamento realizado com sucesso e mensagem enviada ao cliente!",
      agendamento
    });

  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}


