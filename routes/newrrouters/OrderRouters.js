const express = require("express")
const router = express.Router()
const auth = require("../../middleware/authMiddleWare")

const { PlaceOrder, LoadMyOrders, LoadOrderById, GetInvoice, DownloadInvoice } = require("../../controllers/OrderController")

router.post("/PlaceOrder", auth, PlaceOrder)
router.post("/LoadMyOrders", auth, LoadMyOrders)
router.post("/LoadOrderById", auth, LoadOrderById)
router.post("/GetInvoice", auth, GetInvoice)
router.post("/DownloadInvoice", auth, DownloadInvoice)

module.exports = router
