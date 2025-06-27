const path = require('path')
const pug = require('pug')
const nodemailer = require('nodemailer')
const env = require('../config/env.config')

const sendMail = (email, subject, otp, username) => {
  return new Promise((resolve, reject) => {
    const htmlContent = pug.renderFile(path.join(__dirname, '../view/formSendEmail.pug'), { otp, email, username })

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.email.user,
        pass: env.email.pass
      }
    })

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: htmlContent
    }

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('❌ Lỗi khi gửi email:', error)
        resolve(false) // ✅ Trả về false
      } else {
        console.log('✅ Email đã được gửi:', info.response)
        resolve(true) // ✅ Trả về true
      }
    })
  })
}

module.exports = sendMail
