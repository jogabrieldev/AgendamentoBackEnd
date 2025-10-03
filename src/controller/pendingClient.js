
import Appointment from "../models/appointment.js";
import { Op } from "sequelize";

export async function pendingTheClient(req, res) {
    try {
        const { idclient } = req.params;

        if (!idclient) {
            return res.status(400).json({
                success: false,
                message: "É necessário fornecer o ID do cliente."
            });
        }

        const today = new Date();
        const todayStr = today.toISOString().split("T")[0]; 

        const pendingAppointments = await Appointment.findAll({
            where: {
                idClient: idclient,
                status: "Agendado",
                data: {
                    [Op.gte]: todayStr
                }
            }
        });

        if (pendingAppointments.length > 0) {
            return res.status(200).json({
                success: true,
                hasPending: true,
                message: "O cliente possui pendências de agendamento.",
                appointments: pendingAppointments
            });
        } else {
            return res.status(200).json({
                success: true,
                hasPending: false,
                message: "O cliente não possui pendências de agendamento."
            });
        }

    } catch (error) {
        console.error("Erro ao verificar pendências do cliente:", error);
        return res.status(500).json({
            success: false,
            message: "Erro interno ao verificar pendências."
        });
    }
};
