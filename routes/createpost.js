const express = require("express")
const postModule = require("../modules/post")
const httpresponse = require("../utils/httpStatus")

  
  const CreatePost = async(req,res)=>{
   let {title, description,date} = req.body
    try{
        if(req.finduser.role === "admin"){
        let createpost = await  postModule.create({
            title,
            description,
            date,
            createdby:req.finduser
        })
        res.status(httpresponse.CREATED).json({createpost})
        }else{
            res.status(httpresponse.FORBIDDEN).json({
                message:"you cant access this page"
            })
        }
    }catch(err){
        res.status(httpresponse.INTERNAL_SERVER).json({message:err.message})
    }
}

module.exports = {CreatePost}