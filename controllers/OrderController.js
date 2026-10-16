const Joi = require("joi")
const mongoose = require("mongoose")
const cartmodule = require("../modules/cart")
const ordermodule = require("../modules/order")
const invoicemodule = require("../modules/invoice")
const counter = require("../modules/counter")
const httpresponse = require("../utils/httpStatus")
const streamInvoicePdf = require("../utils/invoicePdf")

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100

const placeOrderSchema = Joi.object({
    shippingaddress: Joi.object({
        fullname: Joi.string().trim().required(),
        phone: Joi.string().trim().pattern(/^[0-9+\-\s]{7,15}$/).required(),
        addressline: Joi.string().trim().required(),
        city: Joi.string().trim().required(),
        state: Joi.string().trim().required(),
        pincode: Joi.string().trim().pattern(/^[0-9]{4,10}$/).required()
    }).required(),
    paymentmethod: Joi.string().valid("COD", "CARD", "UPI", "NETBANKING").default("COD")
})

// POST /api/Order/PlaceOrder
// Turns the logged-in user's cart into an order + invoice, then empties the cart.
const PlaceOrder = async (req, res) => {
    const { error, value } = placeOrderSchema.validate(req.body, { stripUnknown: true })
    if (error) {
        return res.status(httpresponse.BAD_REQUEST).json({ message: error.details[0].message })
    }

    const userid = req.finduser._id

    // Atomically "claim" the cart: only succeeds if it has items, and empties it in the same
    // operation, so two simultaneous requests can never order the same cart twice.
    const cart = await cartmodule.findOneAndUpdate(
        { userid, "productdata.0": { $exists: true } },
        { $set: { productdata: [], discountpercentage: 0, grandtotal: 0 } },
        { new: false }
    )
    if (!cart) {
        return res.status(httpresponse.BAD_REQUEST).json({ message: "your cart is empty" })
    }

    let order
    try {
        const items = cart.productdata.map((p) => ({
            productid: p.productid,
            productname: p.productname,
            productbrand: p.productbrand,
            productrate: p.productrate,
            quantity: p.quantity,
            total: round2(p.productrate * p.quantity)
        }))

        const subtotal = round2(items.reduce((acc, i) => acc + i.total, 0))
        const discountpercentage = cart.discountpercentage || 0
        const discountamount = round2((subtotal * discountpercentage) / 100)
        const grandtotal = round2(subtotal - discountamount)

        const orderSeq = await counter.next("order")
        const invoiceSeq = await counter.next("invoice")
        const ordernumber = `ORD-${String(orderSeq).padStart(6, "0")}`
        const invoicenumber = `INV-${String(invoiceSeq).padStart(6, "0")}`

        const orderid = new mongoose.Types.ObjectId()
        const invoiceid = new mongoose.Types.ObjectId()
        const paymentstatus = "PENDING" // COD & gateway payments are confirmed later

        order = await ordermodule.create({
            _id: orderid,
            ordernumber,
            userid,
            items,
            subtotal,
            discountpercentage,
            discountamount,
            grandtotal,
            shippingaddress: value.shippingaddress,
            paymentmethod: value.paymentmethod,
            paymentstatus,
            invoiceid
        })

        const invoice = await invoicemodule.create({
            _id: invoiceid,
            invoicenumber,
            orderid,
            ordernumber,
            userid,
            customer: {
                username: req.finduser.username,
                email: req.finduser.email,
                ...value.shippingaddress
            },
            items: items.map(({ productname, productbrand, productrate, quantity, total }) =>
                ({ productname, productbrand, productrate, quantity, total })),
            subtotal,
            discountpercentage,
            discountamount,
            grandtotal,
            paymentmethod: value.paymentmethod,
            paymentstatus
        })

        return res.status(httpresponse.CREATED).json({
            message: "order placed successfully",
            order,
            invoice
        })
    } catch (err) {
        // roll back: remove any partial order and give the cart back to the user
        if (order) await ordermodule.deleteOne({ _id: order._id }).catch(() => { })
        await cartmodule.updateOne({ userid }, {
            $set: {
                productdata: cart.productdata,
                discountpercentage: cart.discountpercentage,
                grandtotal: cart.grandtotal
            }
        }).catch(() => { })
        return res.status(httpresponse.INTERNAL_SERVER).json({
            message: "internal server error",
            error: err.message
        })
    }
}

// POST /api/Order/LoadMyOrders
const LoadMyOrders = async (req, res) => {
    try {
        const orders = await ordermodule.find({ userid: req.finduser._id }).sort({ createdAt: -1 })
        res.status(httpresponse.OK).json({ orders })
    } catch (err) {
        res.status(httpresponse.INTERNAL_SERVER).json({ message: "internal server error", error: err.message })
    }
}

// POST /api/Order/LoadOrderById   { orderid }
const LoadOrderById = async (req, res) => {
    try {
        const { orderid } = req.body
        if (!mongoose.isValidObjectId(orderid)) {
            return res.status(httpresponse.BAD_REQUEST).json({ message: "invalid orderid" })
        }
        const order = await ordermodule.findOne({ _id: orderid, userid: req.finduser._id })
        if (!order) return res.status(httpresponse.NOT_FOUND).json({ message: "order not found" })
        res.status(httpresponse.OK).json({ order })
    } catch (err) {
        res.status(httpresponse.INTERNAL_SERVER).json({ message: "internal server error", error: err.message })
    }
}

// POST /api/Order/GetInvoice   { orderid }   -> invoice as JSON
const GetInvoice = async (req, res) => {
    try {
        const { orderid } = req.body
        if (!mongoose.isValidObjectId(orderid)) {
            return res.status(httpresponse.BAD_REQUEST).json({ message: "invalid orderid" })
        }
        const invoice = await invoicemodule.findOne({ orderid, userid: req.finduser._id })
        if (!invoice) return res.status(httpresponse.NOT_FOUND).json({ message: "invoice not found" })
        res.status(httpresponse.OK).json({ invoice })
    } catch (err) {
        res.status(httpresponse.INTERNAL_SERVER).json({ message: "internal server error", error: err.message })
    }
}

// POST /api/Order/DownloadInvoice   { orderid }   -> invoice as a PDF file
const DownloadInvoice = async (req, res) => {
    try {
        const { orderid } = req.body
        if (!mongoose.isValidObjectId(orderid)) {
            return res.status(httpresponse.BAD_REQUEST).json({ message: "invalid orderid" })
        }
        const invoice = await invoicemodule.findOne({ orderid, userid: req.finduser._id })
        if (!invoice) return res.status(httpresponse.NOT_FOUND).json({ message: "invoice not found" })

        res.setHeader("Content-Type", "application/pdf")
        res.setHeader("Content-Disposition", `attachment; filename="${invoice.invoicenumber}.pdf"`)
        streamInvoicePdf(invoice, res)
    } catch (err) {
        if (!res.headersSent) {
            res.status(httpresponse.INTERNAL_SERVER).json({ message: "internal server error", error: err.message })
        }
    }
}

module.exports = { PlaceOrder, LoadMyOrders, LoadOrderById, GetInvoice, DownloadInvoice }
