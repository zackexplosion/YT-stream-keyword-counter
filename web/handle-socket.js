const EVENT_TOKEN = process.env.EVENT_TOKEN || 'YEEEEEEEEEEEEEEEEEEE'

let user_live_count = 0
let is_scanner_connected = false

module.exports = ({io, http, handleProgress}) => {
  // user live counter
  io.on('connection', function(socket){
    user_live_count++
    socket.on('disconnect', (reason) => {
      if (socket.id == is_scanner_connected){
        log('scanner disaconnect')
        is_scanner_connected = false
      }
      user_live_count--
    })

    // return counter on new connection
    socket.emit('uuc', user_live_count)

    // reject new scanner connection
    if (is_scanner_connected) return

    // recieve scanner server messages
    socket.on(EVENT_TOKEN, data =>{
      if (!is_scanner_connected) {
        user_live_count--
        is_scanner_connected = socket.id
        log('scanner connected', is_scanner_connected)
      }

      handleProgress(data)
    })
  })

  // brocast to every client every 5 seconds
  setInterval(() => {
    io.emit('uuc', user_live_count)
  }, 1000 * 5)
}