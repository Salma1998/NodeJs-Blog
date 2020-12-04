const mailer = require('nodemailer');
const { mailHost, mailPort, mailUser, mailPass } = require('./enviroment')

const transport = mailer.createTransport({
    host : mailHost,
    port: mailPort,
    auth: {
        user : mailUser,
        pass : mailPass
    }
}); 


const sendMail = (from , to , code , subject ) => {
    return transport.sendMail({
        to : to,
        from : from , 
        text : code , 
        subject : subject
    })
}

module.exports = {
    sendMail, 
    transport
}