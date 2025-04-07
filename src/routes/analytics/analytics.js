// const express = require("express");
// const router = express.Router();
// const mongoose = require("mongoose");
// const EmailTrend = require("../../models/EmailTrend");

// // TREND
// router.get("/trend/:email", async (req, res) => {
//     try {
//         const trends = await EmailTrend.find({ account: req.params.email })
//             .sort({ hour: -1 })
//             .limit(50);

//         res.json({ success: true, data: trends.reverse() });
//     } catch (err) {
//         console.error("Trend fetch error:", err.message);
//         res.status(500).json({ success: false, message: "Failed to fetch trend data" });
//     }
// });

// // QUICK STATUS
// router.get("/quick-status-all", async (req, res) => {
//     try {
//         const collections = await mongoose.connection.db.listCollections().toArray();
//         const allStats = [];

//         for (const col of collections) {
//             const collectionName = col.name;
//             const model = mongoose.models[collectionName] || mongoose.model(collectionName, new mongoose.Schema({}, { strict: false }));
//             const emails = await model.find({}, { folder: 1 }).lean();

//             let inbox = 0;
//             let spam = 0;
//             for (const e of emails) {
//                 if (e.folder === "Inbox") inbox++;
//                 else if (e.folder === "Spam") spam++;
//             }

//             const total = inbox + spam;
//             if (total === 0) continue;

//             const mapToEmail = (collectionName) => {
//                 const raw = collectionName.replace(/_/g, "@");
//                 return raw
//                     .replace("@gmail@coms", "@gmail.com")
//                     .replace("@yahoo@coms", "@yahoo.com")
//                     .replace("@zohomail@ins", "@zohomail.in")
//                     .replace("@yandex@coms", "@yandex.com")
//                     .replace("@aol@coms", "@aol.com")
//                     .replace("@jamii@yandex@coms", "@jamii@yandex.com")
//                     .replace("@roberts@zohomail@ins", "@roberts@zohomail.in");
//             };

//             const account = mapToEmail(collectionName);

//             allStats.push({
//                 account,
//                 inbox_percent: Math.round((inbox / total) * 100),
//                 spam_percent: Math.round((spam / total) * 100),
//                 inbox,
//                 spam,
//                 total,
//             });
//         }

//         res.json({ success: true, data: allStats });
//     } catch (err) {
//         console.error("Quick status all error:", err.message);
//         res.status(500).json({ success: false, message: "Failed to get quick status for all" });
//     }
// });

// module.exports = router;
