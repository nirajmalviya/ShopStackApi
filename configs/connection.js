const mongoose  =  require("mongoose")
  require('dotenv').config();
mongoose.connect(process.env.DB)
.then(()=>{
    console.log("connected");
    
}).catch((err)=>{
    console.log("something went wrong");
})
module.exports = mongoose