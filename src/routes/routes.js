import express from 'express'
import { controllerUser } from '../controller/controllerUser.js'
import { controllerAvailability } from '../controller/controllerAvailabillity.js'
import { controllerService } from '../controller/controllerServices.js'
import { controllerClient } from '../controller/controllerClient.js'
import { verifyToken } from '../middleware/authenticate.js'
import { sendMessage } from '../services/whatsappService.js'
import { login } from '../controller/controllerAuthenticate.js'
const router = express.Router()

//user
router.post('/user' , (req ,res)=>{
    controllerUser.registerUser(req ,res)
})

router.post('/authenticate' ,(req ,res)=>{
    login(req ,res)
})

router.put('/user' , (req , res)=>{
  controllerUser.updateStatusUser(req , res)
})

//Disponnibilidade

router.post('/disponi' , (req , res)=>{
   controllerAvailability.registerAvailability(req ,res)
});

router.get('/api/disponi', (req , res)=>{
    controllerAvailability.getAllAvailabillity(req ,res)
});

router.put('/disponi' , (req ,res)=>{
   controllerAvailability.updateAvailabilityStatus(req ,res)
});

// Service 
router.post('/service' , (req , res)=>{
   controllerService.registerService(req , res)
});

router.get('/api/service' , (req ,res)=>{
   controllerService.getAllServices(req ,res)
});

router.delete('/service', (req , res )=>{
   controllerService.deleteService(req ,res)
});

// Client

router.post('/client', verifyToken, (req ,res)=>{
    controllerClient.registerClient(req , res)
})

router.post('/client/link/:idClient', verifyToken,(req ,res)=>{
   controllerClient.generateAccessLink(req , res)
} );


router.get('/client/acesso/:token',(req , res)=>{
   controllerClient.accessByToken(req ,res)
});

// 
router.post('/test/send' , async(req ,res )=>{
   const {telefone , texto} = req.body

     try {
    await sendMessage(telefone, texto);
    res.status(200).json({ success: true, message: 'Mensagem enviada com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao enviar mensagem.' });
  }
})
export default router