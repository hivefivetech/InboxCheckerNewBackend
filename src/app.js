const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const gmailGetEmailsRoute = require("./routes/gmail/getEmails");
const yahooGetEmailsRoute = require("./routes/yahoo/getEmails");
const zohoGetEmailsRoute = require("./routes/zoho/getEmails");
const yandexGetEmailsRoute = require("./routes/yandex/getEmails");
const aolGetEmailsRoute = require("./routes/aol/getEmails");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/api/gmail/emails", gmailGetEmailsRoute);
app.use("/api/yahoo/emails", yahooGetEmailsRoute);
app.use("/api/zoho/emails", zohoGetEmailsRoute);
app.use("/api/yandex/emails", yandexGetEmailsRoute);
app.use("/api/aol/emails", aolGetEmailsRoute);

module.exports = app;
