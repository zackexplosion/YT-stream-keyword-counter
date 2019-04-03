const db = require('../lib/db')
const db_raw = require('../lib/db-raw')
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

const handleProgress = info => {
  if (!info.status) return
  if (info.progress) {
    info.progress = parseInt(info.progress * 100)
  }
  io.emit('progressUpdate', info)
}

app.use(express.static(path.join(__dirname, '/public')))
app.use(express.static(path.join(__dirname, '/assets')))

// setup view engine
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, '/views'))

// setup index route
app.get('/', function (req, res) {
  let counter = db.get('counter').value()
  res.render('index', {
    YOUTUBE_VIDEO_ID, counter
  })
})

// db download route
app.get('/dbdownload', (req, res) =>{
  res.download(DB_PATH)
})

let user_live_count = 0
// setup server io
io.on('connection', function(socket){
  log('a user connected', socket.id)
  io.emit('updateUserCounter', ++user_live_count)
  socket.on('disconnect', (reason) => {
    io.emit('updateUserCounter', --user_live_count)
    log(socket.id, 'disconnected')
  })
})

// start app
const PORT = process.env.PORT || 3000
http.listen(PORT, function () {
  log(`App serving on http://localhost:${PORT}!`)
  require('./scanner')({db, db_raw, log, moment, handleProgress})
})