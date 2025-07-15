const { Mission,CoupleMissionLog, Couple } = require('../models')
const { create } = require('../models/couple-mission-log.model')


const generateDailyMissions = async () => {
  const missions = await Mission.find({ isActive: true })
  const couples = await Couple.find({ isActive: true })

  const bulk = []

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate()  + 1)


  for (const couple of couples) {
    for (const mission of missions) {
      bulk.push({
        coupleId: couple._id,
        missionId: mission._id,
        dateAssigned: new Date(tomorrow)
      })
    }
  }

  if(bulk.length > 0){
    await CoupleMissionLog.insertMany(bulk, { ordered: false }) 
  }
}


module.exports = {
  generateDailyMissions
}
