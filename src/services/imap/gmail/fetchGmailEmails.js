const { ImapFlow } = require("imapflow");
const mongoose = require("mongoose");

/**
 * Create or fetch a dynamic model for an email collection.
 * @param {string} accountName - Name of the Gmail account (used as the collection name).
 * @returns {mongoose.Model} - Mongoose model for the account's collection.
 */
function getEmailModel(accountName) {
    const collectionName = accountName.replace(/[@.]/g, "_");
    return mongoose.models[collectionName] || mongoose.model(collectionName, new mongoose.Schema(
        {
            account: String,
            subject: String,
            name: String,
            from: String,
            date: Date,
            folder: String,
        },
        { timestamps: true }
    ));
}

/**
 * Fetch emails from Gmail using IMAP.
 * @param {string} user - The email account username.
 * @param {string} pass - The email account password.
 * @param {string[]} folders - The folders to fetch emails from.
 * @returns {Promise<Array>} - Array of fetched emails.
 */
async function fetchEmails(user, pass, folders = ["Inbox", "[Gmail]/Spam"]) {
    const client = new ImapFlow({
        host: "imap.gmail.com",
        port: 993,
        secure: true,
        auth: { user, pass },
    });

    client.on('error', (error) => {
        console.error(`IMAP error for ${user}:`, error.message);
    });

    const emailModel = getEmailModel(user);

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

                const fetchRange = totalMessages > 7 ? `${totalMessages - 6}:*` : "1:*";
                for await (const message of client.fetch(fetchRange, { envelope: true })) {
                    const email = {
                        account: user,
                        subject: message.envelope.subject || "No Subject",
                        name: message.envelope.from?.[0]?.name || "Unknown Sender",
                        from: message.envelope.from?.[0]?.address || "Unknown Sender",
                        date: new Date(message.envelope.date || Date.now()),
                        folder: folder.toLowerCase().includes("spam") ? "Spam" : "Inbox",
                    };

                    const existingEmail = await emailModel.findOne({
                        account: email.account,
                        subject: email.subject,
                        from: email.from,
                        date: email.date,
                    });

                    if (existingEmail && existingEmail.folder !== email.folder) {
                        await emailModel.updateOne({ _id: existingEmail._id }, { $set: { folder: email.folder } });
                    } else if (!existingEmail) {
                        await emailModel.create(email);
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

        await maintainDatabase(emailModel);

        await emailModel.deleteMany({
            $and: [
                { account: user },
                { $nor: fetchedEmailKeys }
            ]
        });

        await client.logout();
        return allEmails;
    } catch (error) {
        console.error(`Error fetching emails for ${user}:`, error.message);
        return [];
    } finally {
        await client.logout().catch((logoutError) =>
            console.warn(`Error during logout for ${user}:`, logoutError.message)
        );
    }
}

/**
 * Ensure the database maintains a maximum of 30 emails and a minimum of 10 emails.
 * @param {mongoose.Model} emailModel - Mongoose model for the account's collection.
 */
async function maintainDatabase(emailModel) {
    const totalEmails = await emailModel.countDocuments();

    if (totalEmails > 30) {
        const excessCount = totalEmails - 30;
        await emailModel
            .find({})
            .sort({ date: 1 })
            .limit(excessCount)
            .then((emails) => {
                const idsToDelete = emails.map((email) => email._id);
                return emailModel.deleteMany({ _id: { $in: idsToDelete } });
            });
    }

    const currentCount = await emailModel.countDocuments();
    if (currentCount < 10) {
        console.warn("Warning: Email count dropped below 10!");
    }
}

module.exports = { fetchEmails };
