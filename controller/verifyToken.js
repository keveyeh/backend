import jwt from 'jsonwebtoken'
export const verifyToken = async (req,res,next)=>{
    try{
        if(!req.headers.authorization){
        return res.status(401).json({
            message:'BAD REQUEST'
        })
    }
    
    const auth = req.headers.authorization.split(" ")[1]
    if(!auth){
        return res.status(401).json({
            message:'NO TOKEN PROVIDED'
        })
    }
    const decodedToken = jwt.verify(auth, process.env.JWT_SECRET)
    req.user = decodedToken
      next()
    }catch(err){
        return res.status(401).json({
            message:'INVALID TOKEN'
        })
    }
}