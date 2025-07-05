var socket = io()

const input = document.querySelector('input')
const button = document.querySelector('[btn-send]')
button.addEventListener('click', () => {
  const userId = button.getAttribute('userId')
  const coupleCode = input.value
  console.log(input.value)
  socket.emit('USER_REQUEST_FRIEND', {
    userId,
    coupleCode
  })
  input.value = ''
})
//hiển thị những người mình gửi yêu cầu
socket.on('SERVER_RETURN_USER_REQUEST', (data) => {
  const bodyRequest = document.querySelector('[body-request]')
  if (bodyRequest) {
    if (button.getAttribute('userId') == data.myUserId) {
      const divUser = document.createElement('div')
      divUser.classList.add('user-info')
      divUser.innerHTML = `
      <div class="user-avatar">U</div>
        <div class="user-details"><strong>${data.userName}</strong></div>
        <div class="user-actions">
        <button class="btn btn-cancel" btn-cancel="${data.userId}">Huỷ</button>
      </div>
      `
      bodyRequest.appendChild(divUser)
    }
  }

  CancelFriends();
})

//bắt lỗi
socket.on('ERROR', (data) => {
  console.log(data)
})

//huỷ kết bạn
const CancelFriends = () =>{
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
}
CancelFriends();

//xoá những người mình huỷ yêu cầu
socket.on('SERVER_RETURN_USER_CANCEL', (data) => {
  const bodyRequest = document.querySelector('[body-request]')
  const myUserId = button.getAttribute('userId')

  if (bodyRequest && myUserId == data.myUserId) {
    const btn = document.querySelector(`[btn-cancel='${data.userId}']`)
    if (btn) {
      const boxUser = btn.closest('.user-info')
      if (boxUser) {
        bodyRequest.removeChild(boxUser)
      }
    }
  }
})

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
