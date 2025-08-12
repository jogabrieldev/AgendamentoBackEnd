import authenticate from "../models/authenticate.js";
import User from "../models/user.js";
import  jsonWebToken from "jsonwebtoken";

const jwt = jsonWebToken

export const login = async (req, res) => {
  const { telefone, senha } = req.body;

  if (!telefone || !senha) {
    return res.status(400).json({ error: 'Telefone e senha são obrigatórios' });
  }

  try {
    const user = await authenticate (telefone, senha);

    if (!user) {
      return res.status(401).json({ error: 'Telefone ou senha inválidos' });
    }

    

     const token = jwt.sign(
         { id: User.idUser, email: User.email }, 
         process.env.JWT_SECRET,                         
         { expiresIn: '1h' }                     
        );


    return res.json({
      message: 'Autenticado com sucesso',
      user: {
        idUser: user.idUser,
        name: user.name,
        email: user.email,
        telefone: user.telefone,
      },
      token:token
      // token,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
};
