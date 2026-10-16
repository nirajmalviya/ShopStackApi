
const cartmodule =  require("../modules/cart")
const httpresponse = require("../utils/httpStatus")
const productmodule =  require("../modules/product")

const RemoveFromCart = async (req, res) => {
  try {
    const { productid } = req.body;

    const findproduct = await productmodule.findById(productid);
    if (!findproduct) {
      return res
        .status(httpresponse.NOT_FOUND)
        .json({ message: "product not found" });
    }

    const rate = Number(findproduct.productrate);

    const reducequantity = await cartmodule.findOneAndUpdate(
      {
        userid: req.finduser._id,
        "productdata.productid": productid,
      },
      {
        $inc: {
          "productdata.$.quantity": -1,
          "productdata.$.total": -rate,
          grandtotal: -rate,
        },
      },
      { new: true }
    );
    
    let removefromcart =  await cartmodule.findOneAndUpdate(  {
        userid: req.finduser._id,
        "productdata.productid": productid,
    },{
        $pull:{
            productdata:{quantity:0}
        }
    },
  { new: true }
)


    if (!reducequantity) {
      return res
        .status(httpresponse.NOT_FOUND)
        .json({ message: "item not found in cart" });
    }

    return res
      .status(httpresponse.CREATED)
      .json({
        message: "the quantity of product is decreased successfully",
        newcart:removefromcart
      });
  } catch (err) {
    console.error(err);
    return res
      .status(httpresponse.INTERNAL_SERVER)
      .json({ message: "internal server error", error: err.message });
  }
};


module.exports = {RemoveFromCart}
