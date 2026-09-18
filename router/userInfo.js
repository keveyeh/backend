import express from 'express'
import { createAccount, loginAccess } from '../controller/user.js'
export const userRoute = express.Router()
userRoute.post("/createAccount",createAccount)
userRoute.post("/login",loginAccess)