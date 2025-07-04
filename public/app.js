var socket = io()

const input = document.querySelector('input')
const button = document.querySelector('[btn-send]')

button.addEventListener('click', () => {
  const userId = button.getAttribute('userId')
  const coupleCode = input.value
  socket.emit('USER_REQUEST_FRIEND', {
    userId,
    coupleCode
  })
  input.value = ''
})

//bắt lỗi
socket.on('ERROR', (data) => {
  console.log(data)
})

//huỷ kết bạn
const btnCancels = document.querySelectorAll('[btn-cancel]')
if (btnCancels.length > 0) {
  btnCancels.forEach((btn) => {
    btn.addEventListener('click', () => {
      const myUserId = button.getAttribute('userId')
      const userId = btn.getAttribute('btn-cancel')
      socket.emit('USER_CANCEL_FRIEND', {
        myUserId,
        userId
      })
    })
  })
}
//từ chối kết bạn
const btnRefuse = document.querySelectorAll('[btn-refuse]')
if (btnRefuse.length > 0) {
  btnRefuse.forEach((btn) => {
    btn.addEventListener('click', () => {
      const myUserId = button.getAttribute('userId')
      const userId = btn.getAttribute('btn-refuse')
      socket.emit('USER_REFUSE_FRIEND', {
        myUserId,
        userId
      })
    })
  })
}
