import User from "./user.js";
import bcrypt from 'bcrypt';

const authenticate = async(telefone, senha)=> {

  const user = await User.findOne({ where: {telefone:telefone} });

  if (!user) {

    return null;
  }


  const validPassword = await bcrypt.compare(senha, user.passwordHash);
  if (!validPassword) {

    return null;
  }

  return user;
};
export default authenticate