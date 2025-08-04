const admin = require('../config/firebase.config')

async function sendNotificationToToken(token, title, body) {
  const message = {
    notification: { title, body },
    token
  }

  return await admin.messaging().send(message)
}

module.exports = { sendNotificationToToken }
