const mongoose = require("mongoose");
// const Category = require("./category");

const productSchema = new mongoose.Schema({
    title: { type: String, default: null },
    description: { type: String, default: null },
    price: { type: Number },
    quantity: { type: Number },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
}, {timestamps: true});

module.exports = mongoose.model("product", productSchema);