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
  handleProgress,
  statusCodeSheet
} = require(path.join(ROOT_DIR, 'util', 'handle-progress'))({io, db})

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'dist')))


// setup view engine
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

require(path.join(__dirname, 'hashpath'))(app)
require(path.join(__dirname, 'handle-socket'))({io, http, handleProgress})
require(path.join(__dirname, 'handle-scanner'))({http, handleProgress})
require(path.join(__dirname, 'chatroom'))({app, http})
require(path.join(__dirname, 'chartdata'))(app)



const other_streaming = [
  'XxJKnDLYZz4',
  'BiOFwDgRO10',
  'j_TtgHGkzAk',
  'dxpWqjvEKaM',
  'Hu1FkdAOws0',
  '4ZVUmEUFwaY'
]
// setup index route
app.get('/', function (req, res) {
  res.render('index', {
    counter: db.get('counter').value(),
    startedAt: db.get('matches[0].created_at').value(),
    history: db.get('matches').takeRight(5).value(),
    // user_live_count,
    other_streaming,
    YOUTUBE_VIDEO_ID
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