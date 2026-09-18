import db from "../db.js"
import crypto from 'crypto'

export const Orders = async (req,res,next)=>{
    try{
        const amount= req.body.amount
        if(!amount){
            return res.status(409).json({
                message:'BAD REQUEST'
            })
        }
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random()*1000)}`
        req.orderNumber = orderNumber
        const userId = req.user.userId
        const sql = 'INSERT INTO orders(order_number,user_id,total_amount,status) VALUES(?,?,?,?)'
        await db.execute(sql,[orderNumber,userId,amount,'Pending'])
        next()
    }catch(error){
     console.error("Orders Error:", error);
     res.status(500).json({
        message:'internal server error'
     })
    }
}

export const orderItems = async (req,res,next)=>{
    try{
        const cart = req.body.cart
        const [row] = await db.execute('SELECT * FROM orders where order_number= ?',[req.orderNumber])
        
        
        if(row.length === 0){
            return res.status(404).json({ message: "Order creation verification failed." });
        }
        
        const orderId = row[0].id
        req.orderId = row[0].id
        
        for(const element of cart){
            await db.execute('INSERT INTO order_items(order_id,product_id,quantity,price) VALUES(?,?,?,?)',[orderId,element.id,element.quantity,element.price])
        }
        
        next()
   }catch(err){
        console.error("OrderItems Error:", err);
        res.status(500).json({
            message:'INTERNAL SERVER ERROR'
        })
   }
}

export const InitiatePayment = async (req, res) => {
    const MOMOApiKey = process.env.MTN_APIKEY
    const MOMOApiSecret = process.env.MTN_APISECRET
    const OMApiKey = process.env.ORANGE_APIKEY
    const OMApiSecret=process.env.ORANGE_APISECRET

    const amount = req.body.amount
    const method = req.body.method;
    const phone = req.body.phone
    let type;
    let accountKey;
    
    if(method==='MTN'){
        type='momo'
        accountKey = Buffer.from(`${MOMOApiKey}:${MOMOApiSecret}`).toString('base64')
    }else{
        type ='om'
        accountKey= Buffer.from(`${OMApiKey}:${OMApiSecret}`).toString('base64')
    }
    
    const userId = req.user.userId; 
    let order_id;
    let unque_id;
    
    try {
        order_id = req.orderId
        unque_id = crypto.randomUUID()
        const external_id = String(unque_id)
        
        const query = `
          INSERT INTO transactions (order_id, payment_method, phone_number, transaction_ref, status) 
          VALUES (?, ?, ?, ?, 'PENDING')
        `;
        await db.query(query, [order_id, method, phone, unque_id]);
        
        const iwomiResponse = await fetch("https://www.pay.iwomitechnologies.com/api/iwomipay_sandbox/iwomipay", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accountKey': accountKey,
                'authorization':"Bearer " + String(req.iwomiToken), 
            },
            body: JSON.stringify({
                country: "cm",
                op_type: "credit",
                amount: String(amount),
                external_id: external_id,
                tel: String(phone), 
                type: String(type),
                motif: 'to pay product',
                callback_url: "https://shopcart-backend-jeffrey/iwomi/iwomi-callback"

            })
        });

        const data = await iwomiResponse.json();
        console.log(data.status)
        
        const apiStatus = data.status ? String(data.status).trim() : "";

        if (apiStatus !== "01" && apiStatus !== "1000") {
            await db.query("UPDATE transactions SET status = 'FAILED' WHERE transaction_ref = ?", [unque_id]);
            await db.query("UPDATE orders SET status='FAILED' WHERE id = ?",[order_id])
            return res.status(400).json({ message: "Payment initialization failed", detail: data.message });
        }
        
        if(apiStatus === "01"){
            await db.query("UPDATE transactions SET status='SUCCESS' WHERE transaction_ref = ?",[unque_id])
            await db.query("UPDATE orders SET status='Paid' WHERE id = ?",[order_id])
            return res.status(200).json({
                message: "Payment was Successful",
                transactionId: external_id,
                status:'SUCCESS'
            });
        } 
        
        return res.status(200).json({
            message: "Transaction initiated successfully. Awaiting phone PIN confirmation.",
            transactionId: external_id,
            orderid:req.orderId,
            redirectUrl: data.redirectUrl || null
        });

    } catch (error) {
        if(unque_id){
             await db.query("UPDATE transactions SET status = 'FAILED' WHERE transaction_ref = ?", [unque_id]);
             await db.query("UPDATE orders SET status='FAILED' WHERE id = ?",[order_id])
        }
        console.error("Payment Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const IwomiCallback = async (req, res) => {
   console.log("incoming iwomi data")
  console.log(req.body)
  const {internal_id,external_id,message,status}= req.body
    if(status === '01'){
        const sql1 = 'SELECT * FROM transactions WHERE transaction_ref = ?'
        const [row]= await db.execute(sql1,[external_id])
        if(row.length !== 0){
            const id = row[0].order_id
            const sql2 = 'UPDATE orders SET status = ? WHERE id=?'
            await db.execute(sql2,['Paid',id])
            const sql3 = 'UPDATE transactions SET status= ? WHERE transaction_ref = ?'
            await db.execute(sql3,['Paid',external_id])
        }
    }
    else{
        const sql1 = 'SELECT * FROM transactions WHERE transaction_ref = ?'
        const [row]= await db.execute(sql1,[external_id])
        if(row.length !== 0){
            const id = row[0].order_id
            const sql2 = 'UPDATE orders SET status = ? WHERE id=?'
            await db.execute(sql2,['Failed',id])
            const sql3 = 'UPDATE transactions SET status= ? WHERE transaction_ref = ?'
            await db.execute(sql3,['Failed',external_id])
        }

    }
  res.sendStatus(200)
    
};
 export const checkStatus = async (req,res)=>{
   const id = req.params.id;
   if(!id){
    return res.status(409).json({
        message:'BAD REUEST'
    })
   }
   try{
    const sql = 'SELECT * FROM transactions WHERE order_id =?'
   const [row] = await db.execute(sql,[id])
   if(row.length === 0){
    return res.status(404).json({
        message:'ORDER NOT FOUND'
     })
   }else{
   return res.status(200).json({
        message: row[0].status
    })
   }
   }catch(err){
    console.error(err.message)
   }
}
export const transaction = async (req,res)=>{
    const id = req.user.userId
    const sql = 'SELECT o.order_number, o.total_amount, o.status, t.transaction_ref,t.created_at,t.phone_number, t.payment_method FROM orders o JOIN transactions t ON o.id = t.order_id WHERE o.user_id = ?'
    const [rows] = await db.execute(sql,[id])
        return res.status(200).json({
            transaction:rows,
            message: rows.length === 0?'NO TRANSACTION YET' : 'TRANSACTION LOADED SUCCESSFULLY'
        })    
}

