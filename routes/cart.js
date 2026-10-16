
const cartmodule =  require("../modules/cart")
const httpresponse = require("../utils/httpStatus")
const productmodule =  require("../modules/product")
const AddToCart = async (req,res)=>{
  try{
    let {productid} = req.body
    const findproduct = await productmodule.findById(productid);
    if(!findproduct) return res.status(httpresponse.NOT_FOUND).josn({message:"productnotfound"})
    const rate = Number(findproduct.productrate);


    let createcart = await cartmodule.findOneAndUpdate(
      {userid:req.finduser._id,
        "productdata.productid":productid},{
      $inc:{"productdata.$.quantity": 1,
        "productdata.$.total": rate, 
          grandtotal: rate  }
    },
    { new: true } 
  ) 


    if(!createcart)
      {
      createcart = await cartmodule.findOneAndUpdate({ userid: req.finduser._id },
       {
         
      $push:{
        productdata:{
          productid,
          productbrand:findproduct.productbrand,
          productname:findproduct.productname,
          quantity:1,
          productrate:rate,

          total:rate 
        }
      },

    
    },
  {new:true, upsert: true,setDefaultsOnInsert: true}
)
}

    let sumoftotalproductamouunt = await cartmodule.findOne({userid:req.finduser._id})
    let totalsum =  sumoftotalproductamouunt.productdata.reduce((acc,curr)=>{
    return acc + curr.total
    },0)


    let recalculategrandtotal =  await cartmodule.findOneAndUpdate({userid:req.finduser._id},{
      $set:{ discountpercentage: 0,
            grandtotal: totalsum
          }
    }, {new:true});
    
res.status(httpresponse.CREATED).json({
  
  recalculategrandtotal
})
  }catch(err){
res.status(httpresponse.INTERNAL_SERVER).json({
  message:`internal server error`,
  error:err.message
})
  }
  
}


const LoadCart = async(req,res)=>{
  try{
   const loadcart = await  cartmodule.findOne({userid:req.finduser._id})
   res.send(loadcart);
  }catch(err){
    return res.status(httpresponse.INTERNAL_SERVER).json({message:"internal server error",error:err.message})
  }
}

module.exports = {AddToCart,LoadCart}
