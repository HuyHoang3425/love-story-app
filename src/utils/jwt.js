const jwt = require('jsonwebtoken')
const env = require('../config/env.config')

const generateToken = (payload,time) => {
  return jwt.sign(payload,env.jwt.secret,{
    expiresIn:time,
  })
}

const verifyToken = (token) =>{
  const payload = jwt.verify(token, env.jwt.secret)
  return payload
}

const extractToken = (req) =>{
  const authHeader = req.headers.authorization;
  if(!authHeader || !authHeader.startsWith("Bearer ")){
    return null
  }
  const token = authHeader.split(" ")[1];
  return token
}

const isTokenExpired = (token) => {
  const decoded = jwt.decode(token) 

  if (!decoded || !decoded.exp) return true 

  const currentTime = Math.floor(Date.now() / 1000) 

  return decoded.exp < currentTime 
}
module.exports = {
  generateToken,
  verifyToken,
  extractToken,
  isTokenExpired
}
