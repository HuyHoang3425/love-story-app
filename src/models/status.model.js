const mongoose = require('mongoose')

const statusSchema = new mongoose.Schema(
  {
    content: String
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Status', statusSchema)
