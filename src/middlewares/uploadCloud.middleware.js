const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const env = require('../config/env.config')

// Configuration
cloudinary.config({
  cloud_name: env.cloudinary.cloud_name,
  api_key: env.cloudinary.api_key,
  api_secret: env.cloudinary.api_setcret
})

const uploadCloudinary = (req, res, next) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result)
          } else {
            reject(error)
          }
        })

        streamifier.createReadStream(req.file.buffer).pipe(stream)
      })
    }

    async function upload(req) {
      let result = await streamUpload(req)
      req.body[req.file.fieldname] = result.url
      next()
    }
    upload(req)
  } else {
    next()
  }
}

module.exports = uploadCloudinary
