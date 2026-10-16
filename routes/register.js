const express = require("express")
const app = express();
const usermodule =  require("../modules/user")
const bcrypt  = require("bcrypt")
const httpresponse = require("../utils/httpStatus")
const cartmodel = require("../modules/cart")

app.use(express.json());
app.use(express.urlencoded({ extended: true }));  
  
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

module.exports =  {Register}
