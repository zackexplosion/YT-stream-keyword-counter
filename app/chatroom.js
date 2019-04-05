const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db-chat.json')
const db = low(adapter)
db.defaults({ messages: [] }).write()

var faker = require('faker')
faker.locale = 'zh_TW'

const cookie = require('cookie')
var users = online_users = {}
module.exports = http => {
  const io = require('socket.io')(http, {
    path: '/chat'
  })
  io.on('connection', (socket) => {
    var new_user = true
    var sent_message = false

    var user
    var _cookie = cookie.parse(socket.handshake.headers.cookie)
    log(_cookie)
    return
    if (_cookie['connect.sid']){
      let cookie_id = _cookie['connect.sid']
    }

    // if (new_user) {

    // }

    user = users[cookie_id] = {
      username: faker.name.findName()
    }

    log(user)


    socket.emit('login', {
      username: user.username,
      history: db.get('messages').takeRight(5).value()
    })

    // when the client emits 'new message', this listens and executes
    socket.on('new message', (data) => {
      // echo globally (all clients) that a person has connected
      // only do this on first message
      if (!sent_message) {
        socket.broadcast.emit('user joined', {
          username: user.username,
        })
      }
      sent_message = true

      let message = {
        username: user.username,
        message: data,
        timestamp: moment()
      }
      // storage message to db
      db.get('messages').push(message).write()
      // we tell the client to execute 'new message'
      io.emit('new message', message)
    })

    // when the client emits 'add user', this listens and executes
    socket.on('change username', (username) => {
      let oldusername = user.username
      // we store the username in the socket session for this client
      user.username = username

      // echo globally (all clients) that a person has connected
      socket.broadcast.emit('username changed', {
        oldusername,
        username
      })
    })

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', () => {
      socket.broadcast.emit('typing', {
        username: user.username
      })
    })

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', () => {
      socket.broadcast.emit('stop typing', {
        username: user.username
      })
    })

    // when the user disconnects.. perform this
    socket.on('disconnect', () => {
      if (sent_message) {

        // echo globally that this client has left
        socket.broadcast.emit('user left', {
          username: user.username,
        })
      }
    })
  })
}