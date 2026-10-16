const express = require("express")
const db = require("./configs/connection")
const app = express();
require('dotenv').config();

const cors = require("cors")
app.use(cors())


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const ProductRoute = require('./routes/newrrouters/ProductRouters')
const DiscountRouters = require('./routes/newrrouters/DiscountRouters')
const CartRouters =  require("./routes/newrrouters/CartRouters")
const AuthRouters = require("./routes/newrrouters/AuthRouters")
const OrderRouters = require("./routes/newrrouters/OrderRouters")


app.use("/api/Product",ProductRoute)
app.use("/api/Discount",DiscountRouters)
app.use("/api/Cart",CartRouters)
app.use("/api/Auth",AuthRouters)
app.use("/api/Order",OrderRouters)

app.listen(process.env.PORT,()=>{
console.log(`Server is running on http://localhost:${process.env.PORT}/`);
})