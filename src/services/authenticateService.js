import User from "../models/user.js";
import bcrypt from 'bcrypt';

export const authenticateLoginSystem = {

  async authenticateLogin (telefone, senha) {
    if(!telefone || !senha){
      return {message:'Falta informaçãoes para login'}
    }
   const phoneUserClear = telefone.replace(/\D/g, "");
    let formattedPhone = phoneUserClear;

    if (phoneUserClear.length === 9) {
      formattedPhone = `5562${phoneUserClear}`;
    } else if (phoneUserClear.length === 13 && phoneUserClear.startsWith("55")) {
      formattedPhone = phoneUserClear;
    }

    const user = await User.findOne({ where: { telefone: formattedPhone } });
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const isPasswordValid = await bcrypt.compare(senha, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Telefone ou senha inválidos');
    }

     return user;
  
  }
}

