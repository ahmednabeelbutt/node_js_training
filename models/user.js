const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fname: { type: String, default: null },
    lname: { type: String, default: null },
    email: { type: String, unique: true },
    password: { type: String },
    role: { type: String }
}, {timestamps: true});

module.exports = mongoose.model("user", userSchema);