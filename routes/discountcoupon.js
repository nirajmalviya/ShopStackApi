
const httpresponse = require("../utils/httpStatus")
const discountmodule = require("../modules/dicount")
const cartmodule = require("../modules/cart")

const CreateDiscountCoupon = async (req, res) => {
  try {
    let { discountname, discountpercent } = req.body
    if (req.finduser.role === "staff") return res.status(httpresponse.SERVICE_UNAVAILABLE).json({ message: `you cant access this page or service` })
    let creatediscountcoupon = await discountmodule.create({
      discountname,
      discountpercent
    })

    res.status(httpresponse.CREATED).json({ creatediscountcoupon })
  } catch (err) {
    res.status(httpresponse.INTERNAL_SERVER).json({ message: `internal server error`, error: err.message })
  }
}

const DeleteDiscount = async (req, res) => {
  try {
    let { discountid } = req.body
    let deletediscountcoupon = await discountmodule.findByIdAndDelete(discountid)
    res.status(httpresponse.CREATED).json({ deletediscountcoupon })
  } catch (err) {
    res.status(httpresponse.INTERNAL_SERVER).json({ message: `internal server error`, error: err.message })
  }
}


const ApplyDiscountCoupon = async (req, res) => {
  try {
    let { couponid } = req.body
    let loadalldiscount = await discountmodule.findById(couponid)
    let findthegrandtotal = await cartmodule.findOne({ userid: req.finduser._id })
    let findcart = await cartmodule.findOneAndUpdate({ userid: req.finduser._id }, {

      $set: {
        discountpercentage: loadalldiscount.discountpercent,
        grandtotal: findthegrandtotal.grandtotal - (findthegrandtotal.grandtotal * loadalldiscount.discountpercent / 100)
      }
    },
      { new: true }
    )

    if (!findcart) return res.status(httpresponse.FORBIDDEN).json({ message: `cant find the cart` })
    res.status(httpresponse.CREATED).json({ message: `the coupon is apllied successfully `, findcart })
  } catch (err) {
    res.status(httpresponse.INTERNAL_SERVER).json({ message: `internal server error`, error: err.message })
  }
}

const RemoveDiscountcoupon = async (req, res) => {
  try {

    let calculategrandtotal = await cartmodule.findOne({ userid: req.finduser._id })
    let totalsum = calculategrandtotal.productdata.reduce((acc, curr) => {
      return acc + curr.total
    }, 0)
    let findcart = await cartmodule.findOneAndUpdate({ userid: req.finduser._id }, {
      $set: {
        discountpercentage: 0,
        grandtotal: totalsum
      }
    },
      { new: true }
    )
    res.status(httpresponse.CREATED).json({ message: `the coupon is removed successfully `, findcart })

  } catch (err) {
    res.status(httpresponse.INTERNAL_SERVER).json({ message: `internal server error`, error: err.message })
  }
}
module.exports = { CreateDiscountCoupon, DeleteDiscount, ApplyDiscountCoupon, RemoveDiscountcoupon }