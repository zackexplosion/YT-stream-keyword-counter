// env params with default value
const YOUTUBE_VIDEO_ID = process.env.YOUTUBE_VIDEO_ID || 'wUPPkSANpyo'
const EVENT_TOKEN = process.env.EVENT_TOKEN || 'YEEEEEEEEEEEEEEEEEEE'

// packages
const path = require('path')
const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

require(path.join(__dirname, '..', 'util', 'common'))
// inject webpack for development
// require(path.join(__dirname, 'webpack.js'))(app)

global.db = require(path.join(__dirname, 'db'))

const {
  handleProgress,
  statusCodeSheet
} = require(path.join(ROOT_DIR, 'util', 'handle-progress'))({io, log, db})

require(path.join(__dirname, 'hashpath'))(app)

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'dist')))


// setup view engine
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

let user_live_count = 0
let is_scanner_connected = false
// user live counter
io.on('connection', function(socket){
  // log('an user connect', socket.id)
  // update user counter
  user_live_count++
  socket.on('disconnect', (reason) => {
    if(socket.id == is_scanner_connected){
      log('scanner disaconnect')
      is_scanner_connected = false
    }
    user_live_count--
  })

  // ignore other scanner connection
  if (is_scanner_connected) return

  // recieve scanner server messages
  socket.on(EVENT_TOKEN, data =>{
    is_scanner_connected = socket.id
    handleProgress(data)
  })
})

function updateUserCounter () {
  io.emit('uuc', user_live_count)
}

// update to client every 5 seconds
setInterval(updateUserCounter, 1000 * 5)

const other_streaming = [
  'XxJKnDLYZz4',
  'DVOHYy_m_qU',
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

require(path.join(__dirname, 'chatroom'))(io)
app.get('/chatroom', (req, res) => {
  res.render('chatroom')
})

require(path.join(__dirname, 'chartdata'))(app)

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

// db download route
// app.get('/dbdownload', (req, res) =>{
//   res.download(DB_PATH)
// })


// start app
const PORT = process.env.PORT || 3000
http.listen(PORT, function () {
  log(`App serving on http://localhost:${PORT}!`)
})