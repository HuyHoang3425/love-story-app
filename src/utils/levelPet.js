const { PetConstants } = require('../constants')

const getHappinessofLevel = (currentHappiness) => {
  for (const item of PetConstants.HAPPY) {
    if (currentHappiness < item.happiness) {
      return item.happiness
    }
  }
  return PetConstants.HAPPY[PetConstants.HAPPY.length - 1].happiness
}

module.exports = {
  getHappinessofLevel
}
