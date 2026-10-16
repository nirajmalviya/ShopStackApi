const productmodule = require("../modules/product")
const httpresponse = require("../utils/httpStatus")


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

module.exports = {LoadAllRating}