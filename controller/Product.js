 import db from "../db.js"
  export const getProduct = async (req,res)=>{
    try{
       const sql = " SELECT * FROM products "
       const [row]= await db.execute(sql)
       res.status(200).json({
         status:'success',
         data:row,
    })
    }catch(error){
          console.error(error.message)
    }
         
  }