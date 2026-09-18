import mysql from 'mysql2'
import 'dotenv/config'
 let db;
 try{
 db = mysql.createPool({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASS,
    database:process.env.DB_NAME,
    waitForConnections:true,
    connectionLimit:10
 }).promise()
 }catch(error){
    console.error('Database not connected',error.message)
 }
 export default db;