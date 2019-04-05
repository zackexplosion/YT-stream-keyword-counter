var faker = require('faker/locale/zh_tw')
var numUsers = 0
module.exports = io => {
  io.on('connection', (socket) => {
    var addedUser = false

    // when the client emits 'new message', this listens and executes
    socket.on('new message', (data) => {
      // we tell the client to execute 'new message'
      io.emit('new message', {
        username: socket.username,
        message: data,
        timestamp: moment()
      })
    })

    // add user
    if (!addedUser){
      // we store the username in the socket session for this client
      socket.username = faker.name.findName()
      ++numUsers
      addedUser = true
      socket.emit('login', {
        username: socket.username,
        numUsers: numUsers
      })
      // echo globally (all clients) that a person has connected
      socket.broadcast.emit('user joined', {
        username: socket.username,
        numUsers: numUsers
      })
    }

    // when the client emits 'add user', this listens and executes
    socket.on('change username', (username) => {
      let oldusername = socket.username
      // we store the username in the socket session for this client
      socket.username = username

      // echo globally (all clients) that a person has connected
      socket.broadcast.emit('username changed', {
        oldusername,
        username,
        numUsers
      })
    })

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', () => {
      socket.broadcast.emit('typing', {
        username: socket.username
      })
    })

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', () => {
      socket.broadcast.emit('stop typing', {
        username: socket.username
      })
    })

    // when the user disconnects.. perform this
    socket.on('disconnect', () => {
      if (addedUser) {
        --numUsers

        // echo globally that this client has left
        socket.broadcast.emit('user left', {
          username: socket.username,
          numUsers: numUsers
        })
      }
    })
  })
}