import 'dotenv/config'
import ngrok from '@ngrok/ngrok'
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
async function forwardToApp() {
  const forwarder = await ngrok.forward({
    addr: "localhost:1500",
    authtoken_from_env: true,
    domain: "visibly-luckiness-punctuate.ngrok-free.dev",
        pooling_enabled: true
  });
  console.log(`Available at: ${forwarder.url()}`);
}

forwardToApp();
const port= 1500;
app.listen(port,()=>{
    console.log(`port at 1500`)
})
