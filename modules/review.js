const mongoose =  require("../configs/connection")

const reviewSchema = new mongoose.Schema({
    productid: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
    userid: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    rating: Number,
    review: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("reviews", reviewSchema);
