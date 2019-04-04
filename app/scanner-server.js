const HOST = process.env.WEB_HOST || 'https://hant.zackexplosion.fun'
const EVENT_TOKEN = process.env.EVENT_TOKEN || 'YEEEEEEEEEEEEEEEEEEE'
const socket = require('socket.io-client')(HOST)
const devSocket = require('socket.io-client')('http://localhost:3000')
const path = require('path')
require(path.join(__dirname, '/common'))

function startScanner() {
  function handleProgress (info) {
    log(info)
    socket.emit(EVENT_TOKEN, info)
    devSocket.emit(EVENT_TOKEN, info)
  }
  require(path.join(__dirname, '/scanner'))({log, handleProgress})
}

var servers = []
function handler (server) {
  servers.push(server)

  if (servers.length == 2) {
    startScanner()
  }
}

socket.on('connect', function(){
  handler('proc')
})


devSocket.on('connect', function(){
  handler('dev')
})
