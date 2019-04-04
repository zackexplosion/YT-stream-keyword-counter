const db = require('./db')
const db_raw = require('./db-raw')
const moment = require('moment-timezone')
moment.locale('zh-tw')
moment.tz.setDefault('Asia/Taipei')
function log(){
  let arg = Array.prototype.slice.call(arguments, 0)
  arg.unshift(moment().format('LL LTS') + ':')
  console.log.apply(null, arg)
}

// env params with default value
const YOUTUBE_VIDEO_ID = process.env.YOUTUBE_VIDEO_ID || 'wUPPkSANpyo'

// packages
const path = require('path')
const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

const { handleProgress, statusCodeSheet } = require('./handleProgress')({io, log})

app.use(express.static(path.join(__dirname, '/public')))
app.use(express.static(path.join(__dirname, '/assets')))

// setup view engine
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, '/views'))

let user_live_count = 0
// setup index route
app.get('/', function (req, res) {
  res.render('index', {
    counter: db.get('counter').value(),
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
app.get('/dbdownload', (req, res) =>{
  res.download(DB_PATH)
})

// setup server io
io.on('connection', function(socket){
  // update user counter
  io.emit('uuc', ++user_live_count)
  socket.on('disconnect', (reason) => {
    io.emit('uuc', --user_live_count)
  })
})


// start app
const PORT = process.env.PORT || 3000
http.listen(PORT, function () {
  log(`App serving on http://localhost:${PORT}!`)
  require('./scanner')({db, db_raw, log, moment, handleProgress})
})