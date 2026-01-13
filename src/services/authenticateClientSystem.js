import validator from 'validator'
import Client from '../models/client'

const authenticateClient ={
    async authenticateClientRegister(name,phone,email){
        if(!name || !phone || !email){throw new Error('Falta informações para cadastro de cliente')}

        if(!validator.isEmail(email)){
            throw new Error('E-mail inválido.')
        }
    }
}