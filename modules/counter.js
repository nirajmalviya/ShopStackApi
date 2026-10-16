const mongoose = require("../configs/connection")

// Simple atomic sequence generator (used for order / invoice numbers)
const counterSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    seq: { type: Number, default: 0 }
})

const Counter = mongoose.model("counter", counterSchema)

Counter.next = async (name) => {
    const doc = await Counter.findOneAndUpdate(
        { name },
        { $inc: { seq: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    )
    return doc.seq
}

module.exports = Counter
