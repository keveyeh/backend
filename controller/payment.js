   export const authenticateUser = async (req,res,next)=>{
      const username = req.body.username
      const password = req.body.password
      if(!username || !password){
        return res.status(409).json({
            message:'BAD REQUESTs'
        })
      }
      const cleanUsername = String(username).trim()
      const clearPassword = String(password).trim()
      try{
        const response = await fetch("https://www.pay.iwomitechnologies.com/api/iwomipay_sandbox/authenticate",
            
            {
                method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                username:cleanUsername,
                password:clearPassword
            })

        })
        const result = await response.json()
        req.iwomiToken = result.token
        
        next()
      }catch(error){
        console.error(error)
         res.status(500).json({
            message:'internal server error'
         })
      }
}
