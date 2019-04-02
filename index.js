// env params with default value
const SOURCE_URL = process.env.SOURCE_URL || 'http://35.199.161.19'
const YOUTUBE_VIDEO_ID = process.env.YOUTUBE_VIDEO_ID || 'wUPPkSANpyo'

// db setup
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)
db.defaults({ count: 0, views:0, reads: 0, messages: [] }).write()

// packages
const express = require('express')
const source_socket = require('socket.io-client')(SOURCE_URL)
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const moment = require('moment')
moment.locale('zh-tw')

const getNow = () =>{
  return `${moment().format('LL')} ${moment().format('LTS')}`
}

// setup index route
app.use(express.static('./public'))
app.set('view engine', 'pug')
const startTime = moment()
app.get('/', function (req, res) {
  res.render('index', {
    startTime, YOUTUBE_VIDEO_ID
  })
})

// setup server io
io.on('connection', function(socket){
  io.emit('initMessages', {
    messages: db.get('messages').takeRight(5).value(),
    count: db.get('count')
  })
  console.log('a user connected', socket.id)
})

// setup source crawler
source_socket.on('connect', function(){
  console.log('connected to', SOURCE_URL)
})

source_socket.on('update', function(data){
  data.datetime = getNow()

  // exclude init message
  if (data.text != '即時字幕載入中...') {
    db.get('messages')
    .push({
      text: data.text,
      datetime: data.datetime
    })
    .write()

    db.update('count', n => data.count ).write()
    db.update('views', n => data.views).write()
    db.update('reads', n => data.reads).write()
  }

  io.emit('update', data)
})

source_socket.on('disconnect', function(){
  console.log('disconnect from', SOURCE_URL)
})

http.listen(process.env.PORT || 3000, function () {
  console.log('Example app listening on port http://localhost:3000!');
})