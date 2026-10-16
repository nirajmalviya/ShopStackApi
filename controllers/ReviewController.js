const productmodule = require("../modules/product")
const httpresponse = require("../utils/httpStatus")
const reviewmodule = require("../modules/review")




const CreateReview = async(req,res)=>{
    try{
        let {productid,rating,review} = req.body
        let fetchproductid = await productmodule.findById(productid)
        if(!fetchproductid) return res.status(httpresponse.CONFLICT).json({message:`cant find the product`})
            let createreview =  await reviewmodule.create({
                productid:productid,
                userid:req.finduser._id,
                rating,
                review
            })

        const pushrating = await productmodule.findByIdAndUpdate(
            productid,{
                $push:{
                    productrating:{
                        userid:req.finduser._id,
                        rating
                    }
                },
            },
             { new: true }
        )
        res.status(201).json({
                message: "Review added successfully",
                createreview,
                pushrating
            });
        
    }catch(err){
    res.status(httpresponse.INTERNAL_SERVER).json({
    message:`internal server error`
    })
    }
}



const LoadAllRating = async(req,res)=>{
try{
  let {_id} =  req.body
  let findprod = await productmodule.findOne({_id})
  if(!findprod) return res.status(httpresponse.CONFLICT).json({message:`the product doesn't exist`})
  const findrating = findprod.productrating
  const totaluser = findprod.productrating.length
  const calculaterating =  findrating.reduce((acc,crr)=>{
    return acc + crr.rating / totaluser 
  },0)
  let roundff = calculaterating.toFixed(2)
  res.status(httpresponse.OK).json({rating:roundff})
}catch(err){
  res.status(httpresponse.INTERNAL_SERVER).json({message:`internal server error`,error:err.message})
}
}

module.exports = {CreateReview,LoadAllRating}