import User from "../models/user.js";
import bcrypt from 'bcrypt'
import  jsonWebToken from "jsonwebtoken";

const jwt = jsonWebToken

export const controllerUser = {


  async registerUser(req , res){
     
    try {
        const {name, data, email,userCpf, password, telefone, status} = req.body
        if(!name || !data || !email || !telefone|| !password){
            res.status(400).json({message:'Falta informações para cadastro de usuario'})
        }

        const dateNow = new Date();
        
        const dataAtual = dateNow.toISOString().split('T')[0]; // "2025-05-23" por exemplo

      if (dataAtual !== data) {
      res.status(400).json({ message: 'Data de cadastro precisa ser a data atual' });
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
        // console.log('new user' , newUser)

        const token = jwt.sign(
         { id: newUser.idUser, email: newUser.email }, 
         process.env.JWT_SECRET,                         
         { expiresIn: '1h' }                     
        );

        if(newUser){
            return res.status(200).json({success:true , user:newUser, token:token})
        }
    } catch (error) {
        console.error('Erro no cadastro' , error)
        res.status(500).json({message: "Erro ao cadastrar usuario"})
    }
  },

   async updateStatusUser(req, res) {
    try {
      const { id } = req.params; // ID do usuário pela URL
      const { status } = req.body; // novo status enviado no corpo da requisição

      if (!status) {
        return res.status(400).json({ message: 'O campo status é obrigatório.' });
      }

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }

      user.status = status;
      await user.save(); // salva a alteração

      return res.status(200).json({ message: 'Status atualizado com sucesso.', user });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      return res.status(500).json({ message: 'Erro ao atualizar status do usuário.' });
    }
  }
}

