import cron from 'node-cron';
import { Op } from 'sequelize';
import Appointment from '../models/appointment.js';

export async function startAppointmentStatusUpdater() {
  // Executa a cada minuto
  cron.schedule('* * * * *', async () => {
    try {
      const agora = new Date();

      // Busca todos os agendamentos que ainda estão 'Agendado' ou 'Confirmado'
      const agendamentos = await Appointment.findAll({
        where: {
          status: { [Op.in]: ['Agendado', ] },
        }
      });

      for (const agendamento of agendamentos) {
        // Combina data + horário do agendamento em um Date
        const [hora, minuto] = agendamento.horario.split(':').map(Number);
        const partes = agendamento.data.split('-').map(Number);
        const dataHoraAgendamento = new Date(partes[0], partes[1] - 1, partes[2], hora, minuto, 0);

        // Se a data e hora já passou
        if (dataHoraAgendamento <= agora) {
          agendamento.status = 'Concluido'; // ou outro status que você preferir
          await agendamento.save();
          console.log(`Agendamento ${agendamento.id} atualizado para Concluído`);
        }
      }
    } catch (err) {
      console.error('Erro ao atualizar status de agendamentos:', err);
    }
  });
}
