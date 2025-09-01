import User from "../models/user.js";
import bcrypt from 'bcrypt'

export const controllerUser = {

  async registerUser(req , res){
     
    try {
        const {name, data, email,userCpf, password, telefone, status} = req.body

        if(!name || !data || !email || !telefone|| !password){
            return res.status(400).json({message:'Falta informações para cadastro de usuario'})
        }

        const dateNow = new Date();
       
      const dataAtual = dateNow.toISOString().split('T')[0]; 

      if (dataAtual !== data) {
        return res.status(400).json({ message: 'Data de cadastro precisa ser a data atual'});
      }

        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
        return res.status(409).json({ message: 'Email já cadastrado.' });
      }

      const cpfExists = await User.findOne({ where: { userCpf } });
        if (cpfExists) {
        return res.status(409).json({ message: 'CPF já cadastrado.' });
      }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await User.create({ name,
        dataCadastro: data,
        email,
        passwordHash,
        userCpf,
        telefone,
        status})
        
        if(newUser){
            return res.status(200).json({success:true , user:newUser})
        }
    } catch (error) {
        console.error('Erro no cadastro' , error)
        return res.status(500).json({message: "Erro ao cadastrar usuario"})
    }
  },

}

