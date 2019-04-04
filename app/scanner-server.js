const HOST = process.env.WEB_HOST || 'https://hant.zackexplosion.fun'
const EVENT_TOKEN = process.env.EVENT_TOKEN || 'YEEEEEEEEEEEEEEEEEEE'
const path = require('path')
require(path.join(__dirname, 'common'))

const HOSTS = [HOST, 'http://localhost:3000']

var servers = []
HOSTS.forEach(h =>{
  const socket = require('socket.io-client')(h)
  socket.on('connect', function(){
    log('connted to:', h)
    servers.push(socket)
  })
})

function handleProgress (info) {
  log(info)
  servers.forEach(s => {
    s.emit(EVENT_TOKEN, info)
  })
}
require(path.join(__dirname, 'scanner'))({log, handleProgress})