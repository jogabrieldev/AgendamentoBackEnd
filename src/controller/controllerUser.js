import { authenticateUser } from "../services/authenticateUserSystem.js";
export const controllerUser = {

  async registerUser(req , res){
    try {
      const {name, data, email,userCpf, password, telefone, status} = req.body

      const newUser = await authenticateUser.authenticateRegister(
        name, data, email, userCpf, password, telefone, status
      );

      return res.status(201).json({
        success: true,
        message: 'Usuário cadastrado com sucesso',
        user: newUser
      });
    } catch (error) {

      let statusCode = 400; 
      if (error.message.includes('já cadastrado')) statusCode = 409;

      return res.status(statusCode).json({
       success: false,
       message: error.message || "Erro ao cadastrar usuario"
      });
    }
  },

}

