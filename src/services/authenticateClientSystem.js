import validator from 'validator';
import Client from '../models/client.js';
import { normalizarTelefone } from '../utils/phone.js';
import bcrypt from 'bcrypt';

export const authenticateClient ={
    async authenticateClientRegister(name,phone,email , password, idUser){
        if(!name || !phone || !email || !password){throw new Error('Falta informações para cadastro de cliente')}

        if(!validator.isEmail(email)){
            throw new Error('E-mail inválido.')
        }

        const telefone = normalizarTelefone(phone);
        if(!telefone){
            throw new Error("Telefone invalido! Deve ter 11 digitos")
        }

        const validPhone = await Client.findOne({where:{telefone:telefone}})
        if(validPhone){
           throw new Error("Numero ja cadastrado no sistema")
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        return {
            name,
            telefone, 
            email,
            password: passwordHash,
            idUser: idUser || 1, // Define o padrão aqui se não houver idUser
            dataCadastro: new Date()
        };
    }
}