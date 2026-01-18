import indisponible from "../models/indisponible.js";
import User from '../models/user.js';
import Appointment from "../models/appointment.js";

export const authenticateIndisponibilidade = {
    
    async validateRegistration(status, horario, dataIndisponivel, idUser, transaction) {
        // 1. Validação de campos obrigatórios
        if (!horario || !dataIndisponivel || !idUser) {
            throw new Error("Não foi passado todos os dados necessarios");
        }

        // 2. Validação de Data Retroativa
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const dataReq = new Date(dataIndisponivel);

        if (dataReq < hoje) {
            throw new Error("A data informada não pode ser no passado");
        }

        // 3. Verifica existência do usuário
        const user = await User.findByPk(idUser, { transaction });
        if (!user) {
            throw new Error('Usuário (barbeiro) não encontrado');
        }

        // 4. Verifica se já existe agendamento ativo (Agendado)
        const agendamentoExistente = await Appointment.findOne({
            where: {
                idUser,
                horario,
                data: dataIndisponivel,
                status: 'Agendado'
            },
            lock: transaction.LOCK.UPDATE,
            transaction
        });

        if (agendamentoExistente) {
            throw new Error("Esse horário já possui um agendamento ativo (Agendado), não pode ser marcado como indisponível.");
        }

        // 5. Verifica se já está marcado como indisponível
        const jaExiste = await indisponible.findOne({
            where: {
                idUser,
                horario,
                dataIndisponivel
            },
            lock: transaction.LOCK.UPDATE,
            transaction
        });

        if (jaExiste) {
            throw new Error("Esse horário já foi marcado como indisponível para essa data");
        }

        // Retorna os dados limpos e prontos para o banco
        return { 
            status: status || 'Indisponível', // Default caso status venha vazio
            horario, 
            dataIndisponivel, 
            idUser 
        };
    }
};