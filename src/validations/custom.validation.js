const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" phải là một ObjectId hợp lệ.')
  }
  return value
}

module.exports = {
  objectId
}
