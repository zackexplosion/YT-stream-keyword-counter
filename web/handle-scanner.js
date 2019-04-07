const EVENT_TOKEN = process.env.EVENT_TOKEN || 'YEEEEEEEEEEEEEEEEEEE'

var is_scanner_connected = false
module.exports = ({io, handleProgress}) => {

  io.on('connection', function(socket){
    if (is_scanner_connected) return
    log('scanner connected', socket.id)

    // recieve scanner server messages
    socket.on(EVENT_TOKEN, data =>{
      is_scanner_connected = socket.id
      handleProgress(data)
    })
  })
}