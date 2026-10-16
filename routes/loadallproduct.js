
const productmodule = require("../modules/product")
const httpresponse = require("../utils/httpStatus")


const LoadAllProduct = async (req,res)=>{
try{
    let product = await productmodule.find({})
    res.send(product)
}catch(err){
    res.status(httpresponse.INTERNAL_SERVER).json({
        message:`internal server error`
    })
}
}


module.exports = {LoadAllProduct}