import authenticate from "../models/authenticate.js";
import User from "../models/user.js";
import  jsonWebToken from "jsonwebtoken";

const jwt = jsonWebToken

export const login = async (req, res) => {
  const { phoneUser, senha } = req.body;


  if (!phoneUser || !senha) {
    return res.status(400).json({ error: 'Telefone e senha são obrigatórios' });
  }
  const phoneUserClear = phoneUser.replace(/\D/g, "");

  let telefone = "";

  try {
  
    if (phoneUserClear.length === 9) {
      telefone = `5562${phoneUserClear}`;
    }

    if (phoneUserClear.length === 13 && phoneUserClear.startsWith("55")) {
      telefone = phoneUserClear;
    }
  
    
    if (!telefone) {
      return res.status(400).json({ error: "Telefone inválido!" });
    }

    console.log('Telefone normalizado:', telefone);

    const user = await authenticate(telefone, senha);

    if (!user) {
      return res.status(401).json({ error: 'Telefone ou senha inválidos' });
    }

    const token = jwt.sign(
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
    console.error(error);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
};

