require('dotenv').config();
const  jwt = require("jsonwebtoken")
const usermodule = require("../modules/user")

const authMiddleware =  async (req,res,next)=>{
    debugger
try{
const token = req.header("Authorization")?.replace("Bearer ", "");
if(!token) return res.status(401).json({message:"no token was provided"})
   const decode =  jwt.verify(token,process.env.SECRET)
   const finduser = await usermodule.findOne({email:decode.email})
   if(!finduser) return res.status(404).json({message:"user not found"})
    req.finduser = finduser
next();
}catch(err){
res.status(401).json({
    message:"unauthorized"
})
}
}
module.exports = authMiddleware