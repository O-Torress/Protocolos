const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "Oscar3torres34@gmail.com",
    pass: "fslj ccrt ymii gbnf",
  }
});


 