const EVENT_TOKEN = process.env.EVENT_TOKEN || 'YEEEEEEEEEEEEEEEEEEE'

module.exports = ({http, handleProgress}) => {
  const io = require('socket.io')(http, {
    path: '/scanner'
  })

  io.on('connection', function(socket){
    // recieve scanner server messages
    socket.on(EVENT_TOKEN, data =>{
      // TODO
      // recieve mutiple scanner
      // ignore other scanner connection
      if (is_scanner_connected) return
      // scanner is not an user
      is_scanner = true
      is_scanner_connected = socket.id
      handleProgress(data)
    })
  })
}