import express from 'express'
import { authenticateUser } from '../controller/payment.js'
import { verifyToken } from '../controller/verifyToken.js'
import { checkStatus, InitiatePayment, IwomiCallback, orderItems, Orders, transaction } from '../controller/orders.js'
 export const route = express.Router()
route.post("/",verifyToken,authenticateUser,Orders,orderItems,InitiatePayment)
route.post(
    "/iwomi-callback", 
    IwomiCallback
)
route.get('/checkStatus/:id',checkStatus)
route.get('/transactionHistory/',verifyToken,transaction)