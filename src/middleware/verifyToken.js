import jsonWebToken from "jsonwebtoken"

const jwt = jsonWebToken

export function verifyToken(req , res , next){
      
     const authHeader  = req.headers['authorization']

     if(!authHeader)return res.status(401).json({message:'Token não fornecido'})

    const token = authHeader.split(' ')[1];

    if(!token) return res.status(401).json({message: "Token nalformatado"})
    
    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.userId=decoded.id
        next()
    } catch (error) {
           return res.status(403).json({ message: "Token inválido" });
    }
}