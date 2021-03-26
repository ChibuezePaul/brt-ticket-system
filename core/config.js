require('dotenv').config();
module.exports = {
    PORT: process.env.PORT || '2000',
    DB_URL: process.env.DB_URL,
    APP_SECRET: process.env.APP_SECRET,
    EMAIL_SERVICE: process.env.EMAIL_SERVICE,
    SENDER_NAME: process.env.SENDER_NAME,
    SENDER_EMAIL: process.env.SENDER_EMAIL,
    SENDER_PASSWORD: process.env.SENDER_PASSWORD,
    SUBJECT: process.env.SUBJECT
};