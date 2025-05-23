const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

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

// All your accounts
const allEmailsList = [
    "pepapihsyd@gmail.com",
    "thomasadward5@gmail.com",
    "stellajamsonusa@gmail.com",
    "foodazmaofficial@gmail.com",
    "watsonjetpeter@gmail.com",
    "dcruzjovita651@gmail.com",
    "doctsashawn@gmail.com",
    "syedtestm@yahoo.com",
    "vexabyteofficial@yahoo.com",
    "jordanmercus1975@yahoo.com",
    "jamie_roberts@zohomail.in",
    "rollyriders@zohomail.in",
    "pollywilmar@zohomail.in",
    "awesome.jamii@yandex.com",
    "boudreauryan@yandex.com",
    "cinthianicola@aol.com",
    "fedricknicosta@aol.com"
];

router.get("/all", async (req, res) => {
    try {
        const results = {};

        for (const email of allEmailsList) {
            const model = getEmailModel(email);
            const emails = await model.find({}).sort({ date: -1 }).limit(25);
            results[email] = emails;
        }

        res.status(200).json({ success: true, data: results });
    } catch (error) {
        console.error("Error fetching all emails:", error.message);
        res.status(500).json({ success: false, message: "Error fetching emails." });
    }
});

module.exports = router;
