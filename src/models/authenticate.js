import User from "./user.js";
import bcrypt from 'bcrypt';

const authenticate = async(telefone, senha)=> {
  // Buscar o usuário pelo telefone
  const user = await User.findOne({ where: { telefone } });

  if (!user) {
    // Usuário não encontrado
    return null;
  }

  // Comparar senha com hash
  const validPassword = await bcrypt.compare(senha, user.passwordHash);
  if (!validPassword) {
    // Senha incorreta
    return null;
  }

  // Autenticado com sucesso
  return user;
};
export default authenticate