  import db from "../db.js";
  import bcrypt from 'bcrypt'
  import jwt from 'jsonwebtoken'
  export const createAccount = async (req,res)=>{ 
        try{
            if(!req.body.name || !req.body.email || !req.body.password || !req.body.phone ){
                return res.status(400).json({
                    message:'Bad request'
                })
            }
            const [rows]= await db.query('SELECT * FROM users WHERE email= ?',[req.body.email])
            if(rows.length !== 0){
                return res.status(409).json({
                    message:'EMAIL ALREADY EXIST'
                })
            }
            const name = req.body.name;
            const email = req.body.email;
            const hashedpassword = await bcrypt.hash(req.body.password,10)
            const phone = req.body.phone
            const sql = 'INSERT INTO users(name,email,password,phone)VALUES(?,?,?,?)';
           await db.execute(sql,[name,email,hashedpassword,phone])
           res.status(201).json({
            message:'USER ADDED SUCCESSFULLY '
           })
        }catch(error){
             res.status(500).json({
                message:`internal server error`
             })
        }
  }
 export const loginAccess = async (req,res)=>{
         try{
             const {email,password}= req.body
             if(!email ||!password){
                return res.status(400).json({
                    message:'BAD REQUEST'
                })
             }
             const sql = 'SELECT * FROM users WHERE email = ?'
             const [rows] = await db.execute(sql,[email])
              if(rows.length !== 0){
                const matches = await bcrypt.compare(password,rows[0].password)
                if(!matches){
                    return res.status(401).json({
                        message:'INVALID EMAIL OR PASSWORD'
                    })
                }
              }else{
                return res.status(401).json({
                    message:'INVALID EMAIL OR PASSWORD'
                })
              }
              const token = jwt.sign(
                {userId:rows[0].id},
                process.env.JWT_SECRET,
                {expiresIn:'30d'}
              )
              res.status(200).json({
                message:'USER LOGIN SUCCESSFULLY',
                token:token,
                user:{
                    id:rows[0].id,
                    name:rows[0].name,
                    email:rows[0].email
                }
              })
         }catch(error){
            res.status(500).json({
                message:'internal  server error' + `${error}`
            })
         }
  }