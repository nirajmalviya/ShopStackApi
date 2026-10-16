const express = require("express")
const router = express.Router()
const auth = require("../../middleware/authMiddleWare")


const {CreateDiscountCoupon} = require("../../controllers/DiscountController")
const {DeleteDiscount} = require("../../controllers/DiscountController")
const {ApplyDiscountCoupon} = require("../../controllers/DiscountController")
const {RemoveDiscountcoupon} = require("../../controllers/DiscountController")

router.post("/CreateDiscountCoupon", auth, CreateDiscountCoupon)
router.post("/DeleteDiscount", auth, DeleteDiscount)
router.post("/ApplyDiscountCoupon", auth, ApplyDiscountCoupon)
router.post("/RemoveDiscountcoupon", auth, RemoveDiscountcoupon)


module.exports = router