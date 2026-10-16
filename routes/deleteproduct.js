
const productmodule = require("../modules/product")
const httpresponse = require("../utils/httpStatus")


const DeleteProduct  = async(req,res)=>{
  try{
    let {_id} = req.body
    let findprod = await productmodule.find({_id})
    if(!findprod) return res.status(httpresponse.CONFLICT).json({message:`the product does not exist`})
    if(req.finduser.role === "admin"){
      let deleteprod =  await productmodule.findByIdAndDelete({_id})
      res.status(httpresponse.OK).json({message:`product successfully`})
    }else{
      res.status(httpresponse.FORBIDDEN).json({message:`you cant access this method`})
    }
  }catch(Err){
    res.status(httpresponse.INTERNAL_SERVER).json({message:`Internam server error`,
      error:Err.message
    })
  }
}

module.exports = {DeleteProduct}