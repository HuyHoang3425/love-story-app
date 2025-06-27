module.exports.generateNumber = (lenght) => {
  const number = '0123456789'
  let result = ''
  for (let i = 0; i < lenght; i++) {
    result += number.charAt(Math.floor(Math.random() * number.length))
  }
  return result;
}
