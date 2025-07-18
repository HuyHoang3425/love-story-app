const { Pet, Couple } = require('../models')
const { getIO } = require('../socket')

const HUNGER_MINUTES = 1 
const HUNGER_VALUE = 5

const decreasePetHunger = async () => {
  const pets = await Pet.find({})
  const now = new Date()
  const io = getIO()

  for (const pet of pets) {
    const lastFedAt = new Date(pet.lastFedAt || pet.createdAt)

    const minutesPassed = Math.floor((now - lastFedAt) / (1000 * 60))
    const decayTimes = Math.floor(minutesPassed / HUNGER_MINUTES)

    if (decayTimes > 0) {
      const totalDecrease = decayTimes * HUNGER_VALUE
      pet.hunger = Math.max(0, pet.hunger - totalDecrease)

      pet.lastFedAt = new Date(lastFedAt.getTime() + decayTimes * HUNGER_MINUTES * 60 * 1000)
      await pet.save()

      const couple = await Couple.findById(pet.coupleId)
      if (couple) {
        const data = {
          hunger: pet.hunger,
          petId: pet.id
        }

        if (couple.userIdA) io.to(couple.userIdA.toString()).emit('PET_DECREASE_HUNGER', data)
        if (couple.userIdB) io.to(couple.userIdB.toString()).emit('PET_DECREASE_HUNGER', data)
      }
    }
  }
}

module.exports = decreasePetHunger
