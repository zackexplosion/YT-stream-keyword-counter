// packages
const path = require('path')
const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

require(path.join(__dirname, '..', 'util', 'common'))

global.db = require(path.join(__dirname, 'db'))

const {
  statusCodeSheet
} = require(path.join(ROOT_DIR, 'util', 'handle-progress'))({io, db})

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'dist')))


// setup view engine
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

require(path.join(__dirname, 'hashpath'))(app)
require(path.join(__dirname, 'handle-socket'))({io})
require(path.join(__dirname, 'chatroom'))({io, app})
require(path.join(__dirname, 'charts'))(app)

const channels = require(path.join(ROOT_DIR, 'util', 'channels'))

// setup index route
app.get('/', function (req, res) {
  res.render('index', {
    channels
  })
})

// app.get('/keywords', (req, res) => {
//   res.render('_keywords', {
//     counter: db.get('counter').value()
//   })
// })

app.get('/codesheet', function (req, res) {
  res.json(statusCodeSheet.map(s =>{
    return {
      c: s.code,
      t: s.text
    }
  }))
})

// start app
const PORT = process.env.PORT || 3000
http.listen(PORT, function () {
  log(`App serving on http://localhost:${PORT}!`)
})