const mongoose = require("../configs/connection")

const orderSchema = new mongoose.Schema({
    ordernumber: { type: String, required: true, unique: true },
    userid: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },

    // snapshot of the cart at the moment the order was placed
    items: [
        {
            productid: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
            productname: { type: String, required: true },
            productbrand: { type: String, required: true },
            productrate: { type: Number, required: true },
            quantity: { type: Number, required: true },
            total: { type: Number, required: true }
        }
    ],

    subtotal: { type: Number, required: true },
    discountpercentage: { type: Number, default: 0 },
    discountamount: { type: Number, default: 0 },
    grandtotal: { type: Number, required: true },

    shippingaddress: {
        fullname: { type: String, required: true },
        phone: { type: String, required: true },
        addressline: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true }
    },

    paymentmethod: { type: String, enum: ["COD", "CARD", "UPI", "NETBANKING"], default: "COD" },
    paymentstatus: { type: String, enum: ["PENDING", "PAID"], default: "PENDING" },
    status: { type: String, enum: ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"], default: "PLACED" },

    invoiceid: { type: mongoose.Schema.Types.ObjectId, ref: "invoice" }
}, { timestamps: true })

module.exports = mongoose.model("order", orderSchema)
