const path = require('path')
const fs = require('fs')
var user_live_count = 0

function handle_cookie(socket, next) {
  // log(socket.handshake.headers)
  return next()
}
// module.exports = () => {
module.exports = ({io}) => {
  let web = io.of('/web')
  const {
    handleProgress
  } = require(path.join(ROOT_DIR, 'util', 'handle-progress'))({io: web, db})

  require(path.join(__dirname, 'handle-scanner'))({io, handleProgress})

  // user live counter
  web.use(handle_cookie)
  web.on('connection', function(socket) {
    user_live_count++
    socket.on('disconnect', (reason) => {
      user_live_count--
    })

    // update counter on new connection
    socket.emit('uuc', user_live_count)

    try {
      const version = fs.readFileSync(path.join(ROOT_DIR, 'REVISION'), 'utf8')
      socket.emit('checkVersion', version)
    } catch (error) {
      log(error)
    }
  })

  // brocast to every client every 5 seconds
  setInterval(() => {
    web.emit('uuc', user_live_count)
  }, 1000 * 5)
}


