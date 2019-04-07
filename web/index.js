// env params with default value
const YOUTUBE_VIDEO_ID = process.env.YOUTUBE_VIDEO_ID || 'wUPPkSANpyo'

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
require(path.join(__dirname, 'chatroom'))({io, app, http})
require(path.join(__dirname, 'chartdata'))(app)

// setup index route
app.get('/', function (req, res) {
  const { id } = req.query
  let channels = require(path.join(ROOT_DIR, 'util', 'channels'))
  let _channel
  log('id', id)
  channels = channels.filter(c => {
    log(c)
    let r = c.id != id
    if (r) {
      _channel = c
    }
    return r
  })

  log(_channel, channels)

  // default channel
  if(!_channel) _channel = channels.shift()

  let history = db.get('matches').takeRight(5).value()
  res.render('index', {
    history,
    _channel,
    channels,
  })
})

app.get('/keywords', (req, res) => {
  res.render('_keywords', {
    counter: db.get('counter').value()
  })
})

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