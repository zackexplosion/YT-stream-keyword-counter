const db = require('./db')
// const db_raw = require('./db-raw')

// env params with default value
const YOUTUBE_VIDEO_ID = process.env.YOUTUBE_VIDEO_ID || 'wUPPkSANpyo'
const EVENT_TOKEN = process.env.EVENT_TOKEN || 'YEEEEEEEEEEEEEEEEEEE'
// packages
const path = require('path')
const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
require(path.join(__dirname, '/common'))

const { handleProgress, statusCodeSheet } = require('./handleProgress')({io, log, db})

app.use(express.static(path.join(BASE_DIR, '/public')))
app.use(express.static(path.join(BASE_DIR, '/assets')))

// setup view engine
app.set('view engine', 'pug')
app.set('views', path.join(BASE_DIR, '/views'))

let user_live_count = 0
// user live counter
io.on('connection', function(socket){
  // log('an user connect', socket.id)
  // update user counter
  user_live_count++
  socket.on('disconnect', (reason) => {
    user_live_count--
  })

  // recieve scanner server messages
  socket.on(EVENT_TOKEN, data =>{
    handleProgress(data)
  })
})

function updateUserCounter () {
  io.emit('uuc', user_live_count)
}

// update to client every 5 seconds
setInterval(updateUserCounter, 1000 * 5)

// setup index route
app.get('/', function (req, res) {
  res.render('index', {
    counter: db.get('counter').value(),
    startedAt: db.get('matches[0].created_at').value(),
    history: db.get('matches').takeRight(5).value(),
    user_live_count,
    YOUTUBE_VIDEO_ID
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