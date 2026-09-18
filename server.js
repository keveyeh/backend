import 'dotenv/config'
import express from 'express'
import db from './db.js';
import { router } from './router/productroute.js';
import cors from 'cors'
import {route} from './router/iwomiAuthenicatedRoute.js';
import { userRoute } from './router/userInfo.js';
const app = express()
       app.use(cors())
       app.use(express.json())
       app.use("/products",router)
       app.use("/iwomi",route)
       app.use('/user',userRoute)
const port= 1500;
app.listen(port,()=>{
    console.log(`port at 1500`)
})
