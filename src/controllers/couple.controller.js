const { Couple } = require('../socket/index');
const {User} = require('../models/index')

const request = async (req, res) => {
  Couple.couple(req,res)
  const user = await User.findOne({ _id: req.user.id })
  const acceptFriends = await User.find({
      _id: { $in: user.acceptFriends }
    }).select('id username');

    const requestFriends = await User.find({
      _id: { $in: user.requestFriends}
    }).select('id username')

  res.render('index', {
    userId: user.id,
    acceptFriends: acceptFriends,
    requestFriends:requestFriends,
  })
}


module.exports = {
  request,
}
