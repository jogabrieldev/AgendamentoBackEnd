import { authenticateIndisponibilidade } from "../services/authenticateIndisponibilidade.js";
import indisponible from "../models/indisponible.js";
import sequelize from "../config/database.js";

export const controllerIndisponible = {

    async registerHoursAndDateIndisponible(req, res) {
        const transaction = await sequelize.transaction();
        
        try {
            const { status, horario, dataIndisponivel,  } = req.body;
            const idUser= req.userId

            const validatedData = await authenticateIndisponibilidade.validateRegistration(
                status, 
                horario, 
                dataIndisponivel, 
                idUser, 
                transaction
            );

            const result = await indisponible.create(validatedData, { transaction });

            await transaction.commit();

            return res.status(201).json({
                message: 'Horario registrado com indisponivel',
                success: true,
                result
            });

        }catch (error) {
          if (transaction) await transaction.rollback();
            
          console.error('Erro no processamento:', error.message);
            
            const isValidationError = error.message && !error.message.includes('Sequelize');
            return res.status(isValidationError ? 400 : 500).json({
              success: false,
              message: error.message || "Erro interno no servidor"
            });
        }
    },

    async getHoursAndDateIndisponible(req, res) {
        try {
            const idUser = req.userId;

            if (!idUser) {
                return res.status(400).json({ message: 'ID do usuário não fornecido', success: false });
            }

            const horarios = await indisponible.findAll({
                where: { idUser },
                raw: true
            });

            return res.status(200).json({ success: true, horarios });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Erro no servidor' });
        }
    }
};