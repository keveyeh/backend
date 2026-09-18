  import express from 'express'
import { getProduct } from '../controller/Product.js'
 export  const router = express.Router()
  router.get("/",getProduct)