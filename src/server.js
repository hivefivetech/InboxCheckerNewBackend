const dotenv = require("dotenv");
const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/mongoConfig");

dotenv.config();
connectDB();

// Cron Job
// require("./analyticsCron");

const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

const { fetchEmails } = require("./services/imap/gmail/fetchGmailEmails");
const { gmailAccounts } = require("./config/imapConfig");

const { fetchYahooEmails } = require("./services/imap/yahoo/fetchYahooEmails");
const { yahooAccounts } = require("./config/imapConfig");

const { fetchZohoEmails } = require("./services/imap/zoho/fetchZohoEmails");
const { zohoAccounts } = require("./config/imapConfig");

const { fetchYandexEmails } = require("./services/imap/yandex/fetchYandexEmails");
const { yandexAccounts } = require("./config/imapConfig");

const { fetchAolEmails } = require("./services/imap/aol/fetchAolEmails");
const { aolAccounts } = require("./config/imapConfig");

// Gmail
setInterval(async () => {
    try {
        for (const account of gmailAccounts) {
            const { user, pass } = account;
            try {
                const emails = await fetchEmails(user, pass);
                io.emit(`${user}_emails`, { event: "gmailEmails", data: emails });
            } catch (error) {
                console.error(`Error fetching emails for ${user}:`, error.message);
            }
        }
    } catch (outerError) {
        console.error(`Unexpected error during Gmail fetch loop:`, outerError.message);
    }
}, 30000);

// Yahoo
setInterval(async () => {
    try {
        for (const account of yahooAccounts) {
            const { user, pass } = account;
            try {
                const emails = await fetchYahooEmails(user, pass);
                io.emit(`${user}_emails`, { event: "yahooEmails", data: emails });
            } catch (error) {
                console.error(`Error fetching Yahoo emails for ${user}:`, error.message);
            }
        }
    } catch (outerError) {
        console.error(`Unexpected error during Yahoo fetch loop:`, outerError.message);
    }
}, 30000);

// Zoho
setInterval(async () => {
    try {
        for (const account of zohoAccounts) {
            const { user, pass } = account;
            try {
                const emails = await fetchZohoEmails(user, pass);
                io.emit(`${user}_emails`, { event: "zohoEmails", data: emails });
            } catch (error) {
                console.error(`Error fetching emails for ${user}:`, error.message);
            }
        }
    } catch (outerError) {
        console.error(`Unexpected error during Gmail fetch loop:`, outerError.message);
    }
}, 30000);

// Yandex
setInterval(async () => {
    try {
        for (const account of yandexAccounts) {
            const { user, pass } = account;
            try {
                const emails = await fetchYandexEmails(user, pass);
                io.emit(`${user}_emails`, { event: "yandexEmails", data: emails });
            } catch (error) {
                console.error(`Error fetching emails for ${user}:`, error.message);
            }
        }
    } catch (outerError) {
        console.error(`Unexpected error during Gmail fetch loop:`, outerError.message);
    }
}, 30000);

setInterval(async () => {
    try {
        for (const account of aolAccounts) {
            const { user, pass } = account;
            try {
                const emails = await fetchAolEmails(user, pass);
                io.emit(`${user}_emails`, { event: "aolEmails", data: emails });
            } catch (error) {
                console.error(`Error fetching emails for ${user}:`, error.message);
            }
        }
    } catch (outerError) {
        console.error(`Unexpected error during Gmail fetch loop:`, outerError.message);
    }
}, 30000);

process.on('uncaughtException', (err) => {
    console.error('Unhandled Exception:', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
