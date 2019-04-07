const EVENT_TOKEN = process.env.EVENT_TOKEN || 'YEEEEEEEEEEEEEEEEEEE'

var is_scanner_connected = false
module.exports = ({io, handleProgress}) => {
  const handle_scanner = function(socket) {
    if (is_scanner_connected) return

    // recieve scanner server messages
    socket.on(EVENT_TOKEN, data => {
      if (!is_scanner_connected) {
        log('scanner connected', socket.id)
        is_scanner_connected = socket.id
      }
      handleProgress(data)
    })

    socket.on('disconnect', (reason) => {
      if(!is_scanner_connected) return
      is_scanner_connected = false
      log('scanner disconnected', socket.id, reason)
    })
  }
  io.on('connection', handle_scanner)
  let scanner = io.of('/scanner')
  scanner.on('connection', handle_scanner)
}