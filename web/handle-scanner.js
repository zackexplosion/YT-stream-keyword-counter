const path = require('path')
const SCANNER_TOKEN = process.env.SCANNER_TOKEN || 'YEEEEEEEEEEEEEEEEEEE'
const CHANNELS = require(path.join(ROOT_DIR, 'util', 'channels'))

const auth = (socket, next) => {
  try {

    // token format
    // ${channel-id}-${TOKEN}
    let { token } = socket.handshake.query
    token = token.split('-')

    let channel = CHANNELS.find(c => c.id == token[0])

    if (token[1] === SCANNER_TOKEN && channel) {
      socket.channel = channel
      return next()
    } else {
      throw new Error('Scanner not authorize')
    }
  } catch (error) {
    console.error(error)
    return next(error)
  }
}

module.exports = ({io, handleProgress}) => {
  let scanner = io.of('/scanner')
  scanner.use(auth)

  scanner.on('connection', socket => {
    const { channel } = socket

    log(channel.id, 'scanner connected', socket.id)

    socket.on('handleProgress', data => {
      // scan finished
      if (data.code && data.code == 7 ){
        const { matches, created_at } = data

        try {
          let { id } = channel
          let row = [created_at, matches]
          db.get(id).push(row).write()
          log(id, 'scan finished', matches)
        } catch (error) {
          log(error)
          return false
        }
      } else {
        if (channel.id == 'cti') {
          handleProgress(data)
        }
      }
    })

    socket.on('disconnect', data => {
      log(channel.id, 'scanner disconnected', socket.id)
    })
  })
}