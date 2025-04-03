const mongoose = require("mongoose");

const trendSchema = new mongoose.Schema({
    account: String,
    hour: Date,
    inbox_percent: Number,
    spam_percent: Number,
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

module.exports = mongoose.model("EmailTrend", trendSchema);
