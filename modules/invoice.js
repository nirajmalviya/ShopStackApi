const mongoose = require("../configs/connection")

const invoiceSchema = new mongoose.Schema({
    invoicenumber: { type: String, required: true, unique: true },
    orderid: { type: mongoose.Schema.Types.ObjectId, ref: "order", required: true, unique: true },
    ordernumber: { type: String, required: true },
    userid: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },

    customer: {
        username: String,
        email: String,
        fullname: String,
        phone: String,
        addressline: String,
        city: String,
        state: String,
        pincode: String
    },

    items: [
        {
            productname: String,
            productbrand: String,
            productrate: Number,
            quantity: Number,
            total: Number
        }
    ],

    subtotal: { type: Number, required: true },
    discountpercentage: { type: Number, default: 0 },
    discountamount: { type: Number, default: 0 },
    grandtotal: { type: Number, required: true },

    paymentmethod: String,
    paymentstatus: { type: String, enum: ["PENDING", "PAID"], default: "PENDING" },
    issuedat: { type: Date, default: Date.now }
}, { timestamps: true })

module.exports = mongoose.model("invoice", invoiceSchema)
