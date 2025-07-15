import express from 'express'
import { controllerUser } from '../controller/controllerUser.js'
import { controllerAvailability } from '../controller/controllerAvailabillity.js'
import { controllerService } from '../controller/controllerServices.js'
import { controllerClient } from '../controller/controllerClient.js'
import { verifyToken } from '../middleware/authenticate.js'
import { sendMessage } from '../services/whatsappService.js'
import { login } from '../controller/controllerAuthenticate.js'
import { getDisponibilidadeDoDia, createAppointment , getAppointments } from '../controller/controllerAppointment.js';
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

router.post('/api/disponi' , (req , res)=>{
   controllerAvailability.registerAvailability(req ,res)
});

router.get('/api/disponi', (req , res)=>{
    controllerAvailability.getAllAvailabillity(req ,res)
});

router.put('/api/disponi/:id' , (req ,res)=>{
   controllerAvailability.updateAvailabilityStatus(req ,res)
});

router.delete('/api/disponi/:id', (req ,res)=>{
   controllerAvailability.deleteAvailability(req ,res)
})

// Service 
router.post('/service' , (req , res)=>{
   controllerService.registerService(req , res)
});

router.get('/api/service' , (req ,res)=>{
   controllerService.getAllServices(req ,res)
});

// AGENDAMENTO
router.get('/horarios-disponiveis/:data',(req ,res)=>{
   getDisponibilidadeDoDia(req ,res)
});

router.get("/appoiments" , (req ,res)=>{
   getAppointments(req , res)
}) 
router.post('/appointments', (req ,res)=>{
   createAppointment(req ,res)
} );



router.put('/api/service/:id' , (req ,res)=>{
  controllerService.updateService(req ,res)
})

router.delete('/api/service/:id', (req , res )=>{
   controllerService.deleteService(req ,res)
});

// Client

router.post('/client', (req ,res)=>{
    controllerClient.registerClient(req , res)
})

router.post('/client/link/:idClient', verifyToken,(req ,res)=>{
   controllerClient.generateAccessLink(req , res)
} );


router.get('/client/acesso/:token',(req , res)=>{
   controllerClient.accessByToken(req ,res)
});

router.put('/client/updateByToken/:token', (req, res) => {
  controllerClient.updateClientByToken(req, res);
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