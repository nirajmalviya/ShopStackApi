const express = require("express")
const router = express.Router()
const auth = require("../../middleware/authMiddleWare")


const {AddToCart} = require("../../controllers/CartController")
const {LoadCart} = require("../../controllers/CartController")
const {RemoveFromCart} = require("../../controllers/CartController")


router.post("/AddToCart", auth, AddToCart)
router.post("/LoadCart", auth, LoadCart)
router.post("/RemoveFromCart", auth, RemoveFromCart)

module.exports = router