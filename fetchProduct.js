//import db from "./db.js";
const fetchProduct= async()=>{
    let response;
    let data;
    try{
       response = await fetch("https://fakestoreapi.com/products")
       if(!response.ok){
        throw new Error('failed to fetch product')
       }
       data =  await response.json()
       const sql = 'INSERT INTO products(name,image,price)VALUES(?,?,?)'
       for(const element of data){
        const priceFcfa = element.price * 565
          await db.execute(sql,[element.title,element.image,priceFcfa])
       }
       console.log('product inserted successfully')
    }catch(error){
        console.log('failed to fetch',error.message)
    }
     

}
export default fetchProduct