const HOST = process.env.WEB_HOST || 'https://hant.zackexplosion.fun'
const EVENT_TOKEN = process.env.EVENT_TOKEN || 'YEEEEEEEEEEEEEEEEEEE'
const path = require('path')
require(path.join(__dirname, 'common'))

// const HOSTS = [HOST, 'http://localhost:3000']

// var servers = []
// HOSTS.forEach(h =>{
//   const socket = require('socket.io-client')(h)
//   socket.on('connect', function(){
//     log('connted to:', h)
//     servers.push(socket)
//   })

//   function handleProgress (info) {
//     socket.emit(EVENT_TOKEN, info)
//   }
//   require(path.join(__dirname, 'scanner'))({handleProgress})
// })

const { getCode } = require(path.join(__dirname, 'handle-progress'))({})



const socket = require('socket.io-client')(HOST)
socket.on('connect', function(){
  log('connted to:', HOST)
})

var last_progress = 0
function handleProgress (info) {
  var code = getCode(info.status)
  var progress = parseInt(info.progress * 100)
  switch(code) {
    case 3:
    let gate = last_progress + 10
    let skip = gate <= progress || gate > 100
    last_progress = progress
    // log('last_progress', last_progress, progress,  skip)
    if (skip) return
    break
  }
  log(info)
  socket.emit(EVENT_TOKEN, info)
}
require(path.join(__dirname, 'scanner'))({handleProgress})


