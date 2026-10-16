const usermodule =  require("../modules/user")
const bcrypt  = require("bcrypt")
const jwt =  require("jsonwebtoken")
const httpresponse = require("../utils/httpStatus")
const cartmodel = require("../modules/cart")
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

const Register =  async(req,res)=>{
    try{
        let {username,password,email,role} = req.body
        let isExistisUser = await usermodule.findOne({username:username})

        if(!isExistisUser) {
            bcrypt.genSalt(10,(err,salt)=>{
            bcrypt.hash(password,salt,async(err,hash)=>{
            let createuser = await usermodule.create({
                    username,
                    email,
                    password:hash,
                    role
                })

                let createcart = await cartmodel.create({
                    userid:createuser._id,
                    grandtotal:0})

                res.status(httpresponse.CREATED).json({createuser,createcart})
            })
        }
        
    )}else{
        return res.status(httpresponse.CONFLICT).json({message:`the user ${username} is already exists`})
    }
    }catch(err){
    res.status(httpresponse.INTERNAL_SERVER).json({message:err.message})
    }
    }




module.exports = {Login,Register}
