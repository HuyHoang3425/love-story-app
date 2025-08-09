const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const env = require('../config/env.config')

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: env.cloudinary.cloud_name,
  api_key: env.cloudinary.api_key,
  api_secret: env.cloudinary.api_secret
})

// Upload buffer lên Cloudinary
function uploadBuffer(buffer, folder = 'chat_images') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) reject(error)
      else resolve(result)
    })
    streamifier.createReadStream(buffer).pipe(stream)
  })
}

// Upload 1 ảnh base64 (có data URI) -> trả về url
async function uploadImage(imagesArray, folder = 'chat_images') {
  if (!Array.isArray(imagesArray) || imagesArray.length === 0) {
    throw new Error('Images phải là mảng và có ít nhất 1 phần tử')
  }

  const base64String = imagesArray[0]
  if (typeof base64String !== 'string') {
    throw new Error('Phần tử đầu tiên trong mảng images phải là chuỗi base64')
  }

  // Lấy phần base64 sau dấu phẩy
  const base64Data = base64String.includes(',') ? base64String.split(',')[1] : base64String

  // Chuyển thành buffer
  const buffer = Buffer.from(base64Data, 'base64')

  if (buffer.length === 0) {
    throw new Error('Dữ liệu ảnh rỗng hoặc base64 không hợp lệ')
  }

  // Upload buffer lên Cloudinary
  const result = await uploadBuffer(buffer, folder)
  return result.secure_url
}

module.exports = {
  uploadImage
}
