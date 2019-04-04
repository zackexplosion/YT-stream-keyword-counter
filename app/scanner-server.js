const HOST = process.env.WEB_HOST || 'https://hant.zackexplosion.fun'
const EVENT_TOKEN = process.env.EVENT_TOKEN || 'YEEEEEEEEEEEEEEEEEEE'
const socket = require('socket.io-client')(HOST)
const path = require('path')

require(path.join(__dirname, '/common'))

socket.on('connect', function() {
  console.log('connected to:', HOST)
  function handleProgress (info) {
    log('EVENT_TOKEN', EVENT_TOKEN, info)
    socket.emit(EVENT_TOKEN, info)
  }
  require(path.join(__dirname, '/scanner'))({log, handleProgress})
})

socket.on('disconnect', function(){
  console.log('disconnect from:', HOST)
})
