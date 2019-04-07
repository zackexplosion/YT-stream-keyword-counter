// const EVENT_TOKEN = process.env.EVENT_TOKEN || 'YEEEEEEEEEEEEEEEEEEE'

let user_live_count = 0

function handle_cookie(socket, next) {
  // log(socket.handshake.headers)
  return next()
}

module.exports = ({io, http, handleProgress}) => {
  io = io.of('/web')
  // user live counter
  io.use(handle_cookie)
  io.on('connection', function(socket) {
    user_live_count++
    socket.on('disconnect', (reason) => {
      user_live_count--
    })

    // update counter on new connection
    socket.emit('uuc', user_live_count)
  })

  // brocast to every client every 5 seconds
  setInterval(() => {
    io.emit('uuc', user_live_count)
  }, 1000 * 5)
}