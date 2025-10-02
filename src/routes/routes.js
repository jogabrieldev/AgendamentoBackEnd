import express from 'express'
import { controllerUser } from '../controller/controllerUser.js'
import { controllerAvailability } from '../controller/controllerAvailabillity.js'
import { controllerService } from '../controller/controllerServices.js'
import { controllerClient } from '../controller/controllerClient.js'
import { verifyToken } from '../middleware/authenticate.js'
import { getCurrentQR  } from '../services/whatsappService.js'
import { login } from '../controller/controllerAuthenticate.js'
import { controllerIndisponible } from '../controller/controllerIndisponible.js'
import { getDisponibilidadeDoDia, createAppointment , getAppointments } from '../controller/controllerAppointment.js';

const router = express.Router()


// teste pra rota
router.get('/', (req, res) => {
  res.send('🚀 API Agendamento está rodando!');
});

router.get('/qr' , async (req ,res)=>{
   
   const qr = getCurrentQR()

    return res.json({ qr });
})
//user
router.post('/user' , (req ,res)=>{
    controllerUser.registerUser(req ,res)
})

router.post('/authenticate' ,(req ,res)=>{
    login(req ,res)
})

//Disponnibilidade

router.post('/api/disponi' , verifyToken, (req , res)=>{
   controllerAvailability.registerAvailability(req ,res)
});

router.get('/api/disponi', verifyToken, (req , res)=>{
    controllerAvailability.getAllAvailabillity(req ,res)
});

router.put('/api/disponi/:id' , verifyToken, (req ,res)=>{
   controllerAvailability.updateAvailabilityStatus(req ,res)
});

router.delete('/api/disponi/:id', verifyToken, (req ,res)=>{
   controllerAvailability.deleteAvailability(req ,res)
})

//Indisponibilidade
router.post('/api/indisponible' , verifyToken, (req ,res)=>{
   controllerIndisponible.registerHoursAndDateIndisponible(req ,res)
})

router.get('/api/indisponible/:idUser' , verifyToken, (req ,res)=>{
   controllerIndisponible.getHoursAndDateIndisponible(req ,res)
})


// Service 
router.post('/service' , verifyToken, (req , res)=>{
   controllerService.registerService(req , res)
});

router.get('/api/service' , verifyToken, (req ,res)=>{
   controllerService.getAllServices(req ,res)
});
router.get('/api/service/barber', verifyToken, (req, res) => {
  controllerService.getAllServicesId(req, res);
});

router.put('/api/service/:id' , verifyToken, (req ,res)=>{
  controllerService.updateService(req ,res)
})

router.delete('/api/service/:id', verifyToken, (req , res )=>{
   controllerService.deleteService(req ,res)
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


// Client

router.post('/client', (req ,res)=>{
    controllerClient.registerClient(req , res)
});


router.get("/client/phone/:phone" , (req , res)=>{
   controllerClient.validatePhoneClient(req ,res)
})

router.get('/client/acesso/:uuid',(req , res)=>{
   controllerClient.accessByToken(req ,res)
});




export default router