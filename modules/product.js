
const { required } = require("joi")
const mongoose = require("../configs/connection")
const reviewschema = require("./review")
const productSchema =  new mongoose.Schema({
    productbrand:{
        type:String,
        require:true
    },
    productname:{
        type:String,
        require:true
    },
    productdescription:{
           type:String,
        require:true
    },
 productimage: {
  type: [String],
  required: true
}
,

    productrate:{
        type:Number,
        require:true
    },
   productrating: [
    {
        userid: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        rating: {
        type: Number ,
        min:0.5,
        max:5,
        required:true
        }
    }
],

    Date:{ type: Date, default: Date.now }
})
module.exports = mongoose.model("product", productSchema)