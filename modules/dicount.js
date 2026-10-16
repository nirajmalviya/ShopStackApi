const mongoose =  require("../configs/connection")

const DiscountSchema =  new mongoose.Schema({
    discountname:{
        type:String,
        require:true,
    },
    discountpercent:{
        type:Number,
        required:true
    }
})


module.exports = mongoose.model("discount",DiscountSchema)