import { authenticateLoginSystem} from "../services/authenticateService.js";
import  jsonWebToken from "jsonwebtoken";

const JWT =jsonWebToken


export const login = async (req, res) => {
  const { phoneUser, senha } = req.body;

  try {

    const user = await authenticateLoginSystem.authenticateLogin(phoneUser,senha);
    const token = JWT.sign(
      { id: user.idUser, email: user.email },
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
      token
    });

  } catch (error) {
    return res.status(401).json({ 
      error: error.message || 'Erro interno no servidor' 
    });
  }
};

