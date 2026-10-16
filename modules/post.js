const mongoose = require("../configs/connection")


const postschema = new mongoose.Schema({
    title:String,
    description:String,
    Date:{ type: Date, default: Date.now },
    createdby:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
})

module.exports = mongoose.model("post", postschema);