const admin = require('firebase-admin')
const serviceAccount = require('../json/love-story-app-4c8d7-firebase-adminsdk-fbsvc-085a74a3e4.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

module.exports = admin
