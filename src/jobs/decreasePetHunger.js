const { Pet, Couple } = require('../models')

const socket = require('../socket')
const { env } = require('../config')
const decreaseHungerHandle = require('../socket/handlers/decreaseHunger')

const decreasePetHunger = async () => {
  const pets = await Pet.find({})
  const now = new Date()
  const io = socket.getIO()

  for (const pet of pets) {
    const lastFedAt = new Date(pet.lastFedAt || pet.createdAt)

    const minutesPassed = Math.floor((now - lastFedAt) / (1000 * 60))
    const decayTimes = Math.floor(minutesPassed / env.pet.hunger_minutes)

    if (decayTimes > 0) {
      const totalDecrease = decayTimes * env.pet.hunger_value
      pet.hunger = Math.max(0, pet.hunger - totalDecrease)

      pet.lastFedAt = new Date(lastFedAt.getTime() + decayTimes * env.pet.hunger_minutes * 60 * 1000)
      await pet.save()

      const couple = await Couple.findById(pet.coupleId)
      if (couple) {
        const data = {
          hunger: pet.hunger,
          petId: pet.id
        }
        decreaseHungerHandle.decreaseHunger(io, couple.userIdA.toString(), couple.userIdB.toString(), data)
      }
    }
  }
}


module.exports = decreasePetHunger
