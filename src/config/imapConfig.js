require("dotenv").config();

const gmailAccounts = [
    { user: process.env.IMAP_USER_GMAIL_FIRST, pass: process.env.IMAP_PASSWORD_GMAIL_FIRST },
    { user: process.env.IMAP_USER_GMAIL_SECOND, pass: process.env.IMAP_PASSWORD_GMAIL_SECOND },
    { user: process.env.IMAP_USER_GMAIL_THIRD, pass: process.env.IMAP_PASSWORD_GMAIL_THIRD },
    { user: process.env.IMAP_USER_GMAIL_FOURTH, pass: process.env.IMAP_PASSWORD_GMAIL_FOURTH },
    { user: process.env.IMAP_USER_GMAIL_FIFTH, pass: process.env.IMAP_PASSWORD_GMAIL_FIFTH },
    { user: process.env.IMAP_USER_GMAIL_SIXTH, pass: process.env.IMAP_PASSWORD_GMAIL_SIXTH },
    { user: process.env.IMAP_USER_GMAIL_SEVENTH, pass: process.env.IMAP_PASSWORD_GMAIL_SEVENTH },
];

const yahooAccounts = [
    { user: process.env.IMAP_USER_YAHOO_FIRST, pass: process.env.IMAP_PASSWORD_YAHOO_FIRST },
    { user: process.env.IMAP_USER_YAHOO_SECOND, pass: process.env.IMAP_PASSWORD_YAHOO_SECOND },
];

const zohoAccounts = [
    { user: process.env.IMAP_USER_ZOHO_FIRST, pass: process.env.IMAP_PASSWORD_ZOHO_FIRST },
    { user: process.env.IMAP_USER_ZOHO_SECOND, pass: process.env.IMAP_PASSWORD_ZOHO_SECOND },
    { user: process.env.IMAP_USER_ZOHO_THIRD, pass: process.env.IMAP_PASSWORD_ZOHO_THIRD },
];

const yandexAccounts = [
    { user: process.env.IMAP_USER_YANDEX_FIRST, pass: process.env.IMAP_PASSWORD_YANDEX_FIRST },
    { user: process.env.IMAP_USER_YANDEX_SECOND, pass: process.env.IMAP_PASSWORD_YANDEX_SECOND },
];

const aolAccounts = [
    { user: process.env.IMAP_USER_AOL_FIRST, pass: process.env.IMAP_PASSWORD_AOL_FIRST },
];

module.exports = { gmailAccounts, yahooAccounts, zohoAccounts, yandexAccounts, aolAccounts };
