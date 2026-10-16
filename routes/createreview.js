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


module.exports = {CreateReview}