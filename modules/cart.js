const mongoose =  require("../configs/connection")

const cartScheme =  new mongoose.Schema({
    userid: { type: mongoose.Schema.Types.ObjectId,
         ref: 'users' },

    productdata:[
    {   

    productname:{
    type:mongoose.Schema.Types.String,
    ref:'product',
    required:true
    },
    productbrand:{
        type:mongoose.Schema.Types.String,
        ref:"product",
        required:true
    },
    productid:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product',
    required: true
    },
    productrate:{
    type:mongoose.Schema.Types.Number,
    required:true,
    ref :'product'
    },
       quantity:{
        type:Number,
        require:true,
        default:1
    },
    total:{
        type:Number,
        require:true
    },
    }
    ],
    discountpercentage:{
    type:mongoose.Schema.Types.Number,
    required:true,
    default:0,
    ref:"discount"
    },
    grandtotal:{
    type:Number,
    required:true,
    default: 0
    }
})

module.exports = mongoose.model("cart",cartScheme)