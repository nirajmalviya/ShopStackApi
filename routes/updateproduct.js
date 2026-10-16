const productmodule = require("../modules/product")
const httpresponse = require("../utils/httpStatus")


const UpdateProduct = async(req,res)=>{
try{
    let{_id,productbrand,productname,productdescription,productimage,productrate} = req.body
    let findprod = await productmodule.findOne({_id})
    if(!findprod) return res.status(httpresponse.CONFLICT).json({message:`the product does not exist`})
    let updateproduct = await productmodule.findByIdAndUpdate({_id},{
    productbrand,
    productname,
    productdescription,
    productimage,
    productrate
    },
     { new: true }
  )
  res.status(httpresponse.OK).json({updateproduct,message:`updated successfully`})
  }catch(err){
  res.status(httpresponse.INTERNAL_SERVER).json({message:`Internal Server Error`})
  }

}

module.exports = {UpdateProduct}

