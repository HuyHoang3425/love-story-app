const path = require("path");
const pug = require("pug");
const nodemailer = require("nodemailer");
require('dotenv').config()


const sendMail = (email, subject, otp ,username) => {
  // Render HTML từ file pug, truyền vào biến otp
  const htmlContent = pug.renderFile(
    path.join(__dirname, "../view/formSendEmail.pug"),
    { otp: otp, email: email ,username:username}
  );

  // Cấu hình transporter Gmail
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    html: htmlContent,
  };

  // Gửi email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error("❌ Lỗi khi gửi email:", error);
    }
    console.log("✅ Email đã được gửi:", info.response);
  });
};

module.exports = sendMail;
