const KEYWORDS = (process.env.TARGET_KEYWORDS || '韓|國瑜|韓國瑜').split('|')
const db = require('./db')
// const db_raw = require('./db-raw')
const randomColor = () => {
  var letters = '0123456789ABCDEF'
  var color = '#'
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

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

const getDate = d =>{
  return moment(d, ["YYYY年MM月DD日 hh:mm:ss"])
}

var chartdata = null
app.get('/chartdata', function (req, res) {
  if (chartdata && moment.duration(getDate(chartdata.now).diff(moment()) < moment.duration(5, 'minutes') )) {
    return res.json(chartdata)
  }
  // let keywords = Object.keys(db.get('counter').value())
  let ranges = 6
  // filter out of range data
  let matches = db.get('matches').value().filter(m => {
    let a = getDate(m.created_at)
    let b = moment().subtract(ranges, 'hour').startOf('hour')
    return a > b
  })
  let x = []
  let data = []

  let sheets = {}
  // counter
  for (let i = 0; i <= ranges; i++){
    let a = moment().subtract(ranges - i, 'hour').startOf('hour')
    let b = moment().subtract(ranges - i -1, 'hour').startOf('hour')
    data[i] = 0

    KEYWORDS.forEach(k => {
      matches.forEach(m =>{
        let t = getDate(m.created_at)
        // log('t', t.format('lll'), 'is between?', a.format('lll'), b.format('lll'), t.isBetween(a,b))
        // log(m.matches, k, m.matches.indexOf(k))
        if (m.matches.indexOf(k) != -1 && t.isBetween(a,b)) {
          if(!sheets[k]) sheets[k] = {
            data: Array(ranges+1).fill(0),
            borderWidth: 3,
            borderColor: randomColor(),
            label: k
          }
          sheets[k].data[i]++
        }
        if (t.isBetween(a,b)) {
          data[i]++
        }
      })
    })

    x.unshift(b.format('LT'))
  }

  let now = moment().format('lll')

  chartdata = {
    sheets,
    data,
    x,
    now
  }
  res.json(chartdata)
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

// db download route
// app.get('/dbdownload', (req, res) =>{
//   res.download(DB_PATH)
// })


// start app
const PORT = process.env.PORT || 3000
http.listen(PORT, function () {
  log(`App serving on http://localhost:${PORT}!`)
})