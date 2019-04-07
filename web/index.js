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
require(path.join(__dirname, 'chatroom'))({io, app})
require(path.join(__dirname, 'chartdata'))(app)

const CHANNELS = require(path.join(ROOT_DIR, 'util', 'channels'))
function getChannels (req) {
  // const id = req.query.id || 'cti'
  const { id } = req.query
  let channel
  let channels = CHANNELS.filter(c => {
    let r = c.id == id
    if (r) {
      // channel = Object.assign({}, c)
      channel = c
    }
    return !r
  })

  // if id not found
  if (!channel) {
    let c = JSON.parse(JSON.stringify(CHANNELS))
    channel = c.shift()
    channels = c
  }

  // log(channel)
  // log(channels)

  let history = []
  if (!channel.skip) {
    history = db.get(channel.id).takeRight(5).value()
  }

  return {
    channel,
    channels,
    history
  }
}

// setup index route
app.get('/', function (req, res) {
  res.render('index', {
    ...getChannels(req)
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