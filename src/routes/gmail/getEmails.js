const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

/**
 * Dynamically get the model for the Gmail account
 * @param {string} accountName - The Gmail account (e.g., `pepapihsyd@gmail.com`).
 * @returns {mongoose.Model} - The Mongoose model for the collection.
 */
function getEmailModel(accountName) {
    const collectionName = accountName.replace(/[@.]/g, "_");
    return mongoose.models[collectionName] || mongoose.model(collectionName, new mongoose.Schema({
        subject: String,
        name: String,
        from: String,
        date: Date,
        folder: String,
    }, { timestamps: true }));
}

router.get("/:email", async (req, res) => {
    const { email } = req.params;

    try {
        const emailModel = getEmailModel(email);
        // const emails = await emailModel.find({}).sort({ date: -1 }).limit(10); // Fetch latest 10 emails
        const emails = await emailModel.find({}).sort({ date: -1 }); // Fetch latest 10 emails
        res.status(200).json({ success: true, emails });
    } catch (error) {
        console.error(`Error fetching emails for ${email}:`, error.message);
        res.status(500).json({ success: false, message: "Failed to fetch emails." });
        return;
    }
});

module.exports = router;
