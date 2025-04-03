const cron = require("node-cron");
const mongoose = require("mongoose");
const EmailTrend = require("./models/EmailTrend");

cron.schedule("*/15 * * * * *", async () => {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const currentTime = new Date();

    for (const col of collections) {
        const collectionName = col.name;
        const model = mongoose.models[collectionName] || mongoose.model(collectionName, new mongoose.Schema({}, { strict: false }));
        const emails = await model.find({}, { folder: 1 }).lean();

        let inbox = 0, spam = 0;
        for (const e of emails) {
            if (e.folder === "Inbox") inbox++;
            else if (e.folder === "Spam") spam++;
        }

        const total = inbox + spam;
        if (total === 0) continue;

        const account = collectionName
            .replace(/_/g, "@")
            .replace("@gmail@com", "@gmail.com")
            .replace("@yahoo@com", "@yahoo.com")
            .replace("@zohomail@ins", "@zohomail.in")
            .replace("@yandex@com", "@yandex.com")
            .replace("@aol@com", "@aol.com");

        await EmailTrend.create({
            account,
            hour: currentTime,
            inbox_percent: Math.round((inbox / total) * 100),
            spam_percent: Math.round((spam / total) * 100),
        });

        const count = await EmailTrend.countDocuments({ account });
        if (count > 7) {
            const toDelete = await EmailTrend.find({ account })
                .sort({ createdAt: 1 })
                .limit(count - 7);
            const idsToDelete = toDelete.map(doc => doc._id);
            await EmailTrend.deleteMany({ _id: { $in: idsToDelete } });
        }
    }

    console.log("✅ Hourly inbox/spam snapshot saved");
});
