import express from 'express'
import dataBase  from './src/models/initModels.js'
import './src/models/associations.js'
import router from './src/routes/routes.js'
import { connectToWhatsApp } from './src/services/whatsappService.js'

const app = express()

app.use(express.json())

app.use(router)
connectToWhatsApp();

//  

dataBase.sequelize.sync({alter:true}).then(()=>{
    console.log('banco Sicronizado')

    app.listen(3000,()=>{
    console.log('Server road port 3000')
})
})

