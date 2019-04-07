const HOST = process.env.WEB_HOST || 'https://hant.zackexplosion.fun'
const TOKEN = process.env.ACCESS_TOKEN || 'xx-YEEEEEEEEEEEEEEEEEEE'
const path = require('path')
require(path.join(__dirname, '..', 'util', 'common'))


const { getCode } = require(path.join(ROOT_DIR, 'util', 'handle-progress'))({})
const socket = require('socket.io-client')(HOST + '/scanner', {
  query: {
    token: TOKEN
  }
})
socket.on('connect', function(){
  log('Scanner connected to', HOST, 'token:', TOKEN)

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
    socket.emit('handleProgress', info)
  }
  require(path.join(__dirname, 'scanner'))({handleProgress})
})

socket.on('error', d =>{
  log(d)
  process.exit(1)
})
