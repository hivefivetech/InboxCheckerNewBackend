const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema({
    account: { type: String, required: true },
    subject: { type: String, required: true },
    name: { type: String, required: true },
    from: { type: String, required: true },
    date: { type: Date, required: true },
    folder: { type: String, required: true },
}, { timestamps: true });

const Email = mongoose.model("Email", emailSchema);
module.exports = Email;
