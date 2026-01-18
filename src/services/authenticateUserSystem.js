import User from "../models/user.js";
import bcrypt from 'bcrypt'
import validator from 'validator'
import { validationCPF } from "../utils/validCpf.js";

export const authenticateUser = {
     
    async authenticateRegister(name, data, email,userCpf, password, telefone, status ){
        if(!name || !data || !email || !telefone || !password){throw new Error('Falta informações para cadastro de usuario.');}

        const dateNow = new Date();
        const dataAtual = dateNow.toISOString().split('T')[0]; 

        if (dataAtual !== data) {
            throw new Error('Data de cadastro precisa ser a data atual');
        }

        if(!validator.isEmail(email)){
         throw new Error('E-mail inválido.');
        }

        const cpfSomenteNumeros = userCpf ? userCpf.replace(/\D/g, "") : "";

        console.log("CPF" ,  cpfSomenteNumeros)

    if (cpfSomenteNumeros.length !== 11 || !validationCPF(cpfSomenteNumeros)) {
      throw new Error('CPF inválido. Certifique-se de digitar os 11 dígitos corretamente.');
    }

        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            throw new Error('Email já cadastrado.');
        }

        const cpfExists = await User.findOne({ where: { userCpf } });
        if (cpfExists) {
            throw new Error('CPF já cadastrado.');
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await User.create({ name,
            dataCadastro: data,
            email,
            passwordHash,
            userCpf,
            telefone,
            status})

        return newUser;
    }
}
