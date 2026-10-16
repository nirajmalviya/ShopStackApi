const usermodule =  require("../modules/user")
const bcrypt  = require("bcrypt")
const jwt =  require("jsonwebtoken")
const httpresponse = require("../utils/httpStatus")
require('dotenv').config();



const Login =  async(req,res)=>{
    let {username,password} = req.body  
    const user = await  usermodule.findOne({username})
    if(!user) return res.status(httpresponse.UNAUTHORIZED).json({message:"user not found"})
     bcrypt.compare(password,user.password,(err, result)=>{
        if(err){
             console.error("bcrypt.compare error:", err);
        return res.status(httpresponse.INTERNAL_SERVER).send("Internal server error");
        }
        if(!result){
             return res.status(httpresponse.UNAUTHORIZED).send("Invalid email or password");
      
        }
        let token = jwt.sign({email:user.email}, process.env.SECRET)
      res.send({token})
    })
}


module.exports = {Login}