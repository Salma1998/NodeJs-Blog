require("dotenv").config();

const port = process.env.PORT;
const dbName = process.env.DB_NAME;
const dbPort = process.env.DB_PORT;
const dbHost = process.env.DB_HOST;
const tokenSecret = process.env.TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const mailPort = process.env.MAIL_PORT;
const mailHost = process.env.MAIL_HOST;
const mailUser = process.env.MAIL_USER;
const mailPass = process.env.MAIL_PASS;
const articleCoverUrl = `${dbHost}:${port}/public/articles/`;
const authorImgUrl = `${dbHost}:${port}/public/articles/userImage/`;
module.exports = {
    port,
    dbHost,
    dbName,
    dbPort,
    tokenSecret,
    refreshTokenSecret,
    mailHost,
    mailPass,
    mailPort,
    mailUser,
    articleCoverUrl,
    authorImgUrl,
};