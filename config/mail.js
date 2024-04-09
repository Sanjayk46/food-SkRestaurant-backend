const  FormData = require ('form-data');
// const  Mailgun = require('mailgun.js');

const  getClient=()=> nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER_MAILER,
    pass: process.env.USER_PASS,
  },
});
console.log(user.email);
// {
//   const mailgun = new Mailgun(FormData);
//   const client = mailgun.client({
//     username: 'api',
//     key: process.env.MAILGUN_API_KEY,
//   });

//   return client;
// }

module.exports = getClient;
