const HOST = process.env.WE_HOST || 'https://hant.zackexplosion.fun'
const socket = require('socket.io-client')(HOST)
const path = require('path')
require(path.join(__dirname, '/common'))
socket.on('connect', function(){
  console.log('connected to:', HOST)
  function handleProgress (info) {
    log(info)
    socket.emit('yeeeee', info)
  }
  require(path.join(__dirname, '/scanner'))({log, handleProgress})
})


socket.on('disconnect', function(){})


  // prevent same result
  var same_result = true
  var is_found_matches = false
  if ( last_matched != matches ){
    last_matched = matches
    same_result = false
    var counter = db.get('counter').value()
    KEYWORDS.forEach(k => {
      if (matches.indexOf(k) > 0) {
        is_found_matches = true
        counter[k]++
      }
    })
  }

  let created_at = moment().format('LL LTS')
  if (is_found_matches) {
    handleProgress({
      created_at,
      counter,
      matches,
      raws,
      status: 'update counter'
    })
  } else {
    handleProgress({status: 'Counter not changed.', matches})
  }