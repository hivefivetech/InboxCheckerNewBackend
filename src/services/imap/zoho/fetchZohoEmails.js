const { ImapFlow } = require("imapflow");
const mongoose = require("mongoose");

/**
 * Mongoose Schema for Zoho emails.
 */
const emailSchema = new mongoose.Schema(
    {
        account: { type: String, required: true },
        subject: { type: String, required: true },
        name: { type: String, required: true },
        from: { type: String, required: true },
        date: { type: Date, required: true },
        folder: { type: String, required: true },
    },
    { timestamps: true }
);

/**
 * Fetch emails from Zoho using IMAP.
 * @param {string} user - The email account username.
 * @param {string} pass - The email account password.
 * @param {string[]} folders - The folders to fetch emails from.
 * @returns {Promise<Array>} - Array of fetched emails.
 */
async function fetchZohoEmails(user, pass, folders = ["Inbox", "Spam"]) {
    const client = new ImapFlow({
        host: "imap.zoho.in",
        port: 993,
        secure: true,
        auth: { user, pass },
    });

    client.on('error', (error) => {
        console.error(`IMAP error for Zoho account ${user}:`, error.message);
    });

    const collectionName = user.replace(/[@.]/g, "_");
    const EmailModel = mongoose.models[collectionName] || mongoose.model(collectionName, emailSchema);

    try {
        await client.connect();
        const allEmails = [];
        const fetchedEmailKeys = [];

        for (const folder of folders) {
            const lock = await client.getMailboxLock(folder);
            try {
                const status = await client.status(folder, { messages: true });
                const totalMessages = status.messages ?? 0;

                if (totalMessages === 0) continue;

                const fetchRange = totalMessages > 5 ? `${totalMessages - 4}:*` : "1:*";
                for await (const message of client.fetch(fetchRange, { envelope: true })) {
                    const email = {
                        account: user,
                        subject: message.envelope.subject || "No Subject",
                        name: message.envelope.from?.[0]?.name || "Unknown Sender",
                        from: message.envelope.from?.[0]?.address || "Unknown Address",
                        date: new Date(message.envelope.date || Date.now()),
                        folder: folder.toLowerCase().includes("spam") ? "Spam" : "Inbox",
                    };

                    const existingEmail = await EmailModel.findOne({
                        account: email.account,
                        subject: email.subject,
                        from: email.from,
                        date: email.date,
                    });
                    
                    if (existingEmail && existingEmail.folder !== email.folder) {
                        await EmailModel.updateOne({ _id: existingEmail._id }, { $set: { folder: email.folder } });
                    } else if (!existingEmail) {
                        await EmailModel.create(email);
                    }                    

                    allEmails.push(email);
                    fetchedEmailKeys.push({
                        account: email.account,
                        subject: email.subject,
                        from: email.from,
                        date: email.date,
                    });
                }
            } finally {
                lock.release();
            }
        }

        await maintainDatabase(EmailModel);

        // await EmailModel.deleteMany({
        //     $and: [
        //         { account: user },
        //         { $nor: fetchedEmailKeys }
        //     ]
        // });

         // await EmailModel.deleteMany({
        //     $nor: [
        //         { account: user },
        //         { $and $nor: fetchedEmailKeys }
        //     ]
        // });

        return allEmails;
    } catch (error) {
        console.error(`Error fetching emails for ${user}:`, error.message);
        return [];
    } finally {
        await client.logout().catch((logoutError) =>
            console.warn(`Error during Zoho logout for ${user}:`, logoutError.message)
        );
    }
}

/**
 * Ensure the database maintains a maximum of 30 emails and a minimum of 10 emails.
 * @param {mongoose.Model} EmailModel - Mongoose model for the collection.
 */
async function maintainDatabase(EmailModel) {
    const totalEmails = await EmailModel.countDocuments();

    if (totalEmails > 30) {
        const excessCount = totalEmails - 30;
        await EmailModel
            .find({})
            .sort({ date: 1 })
            .limit(excessCount)
            .then((emails) => {
                const idsToDelete = emails.map((email) => email._id);
                return EmailModel.deleteMany({ _id: { $in: idsToDelete } });
            });
    }

    const currentCount = await EmailModel.countDocuments();
    if (currentCount < 10) {
        console.warn("Warning: Email count dropped below 10!");
    }
}

module.exports = { fetchZohoEmails };
