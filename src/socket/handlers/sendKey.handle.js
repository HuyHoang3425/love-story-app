const { usersOnline } = require('../../utils')

const sendKey = (io, socket) => {
  console.log("chạy vào hàm này");
  socket.on('USER_SEND_PUBLIC_KEY',(data) => {
    socketMyLove = usersOnline.getSocketId(data.myLoveId.toString())
    console.log("Dataaaa" + data)
    if(!socketMyLove){
      socket.emit('ERROR',{
        message:"lỗi không tìm thấy My Love"
      })
      return
    }
    io.to(socketMyLove).emit('SERVER_RETURN_PUBLIC_KEY', {
      public_key:data.public_key
    })
  })
}

module.exports = {
  sendKey
}
