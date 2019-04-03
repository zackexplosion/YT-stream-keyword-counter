const KEYWORDS = (process.env.TARGET_KEYWORDS || '韓|國瑜|韓國瑜').split('|')
const SCAN_INTERVAL = parseInt(process.env.SCAN_INTERVAL || 10)
const rimraf = require('rimraf')
var last_matched = ''
module.exports = async function main (args) {
  const { db, log, db_raw, handleProgress, moment} = args
  var scan_result
  try {
    // screenshot from stream
    await require('../lib/stream-to-image')(handleProgress)

    // run OCR
    scan_result = await require('../lib/image-to-text-and-grap')(handleProgress)

    // clear tmp dir
    await new Promise((resolve, reject) => {
      rimraf('./tmp/*', function(err){
        if (err) reject(err)
        resolve()
      })
    })
  } catch (error) {
    log(error)
  }

  const { matches , raws } = scan_result

  // prevent same result
  var same_result = true
  if ( last_matched != matches ){
    last_matched = matches
    same_result = false
    var counter = db.get('counter').value()
    var is_found_matches = false
    KEYWORDS.forEach(k => {
      if (matches.indexOf(k) > 0) {
        is_found_matches = true
        counter[k]++
      }
    })
    db.update('counter', counter).write()

    let created_at = moment().format('LL LTS')
    db.get('matches').push({
      created_at, matches
    }).write()

    db_raw.get('matches').push({
      created_at, raws
    }).write()
  }


  if (is_found_matches && !same_result) {
    handleProgress({code: 'COUNTER_CHANGED', counter, matches, status: `Counter updated.`})
  } else {
    handleProgress({status: 'Counter not changed.', matches})
  }

  let countdown = SCAN_INTERVAL
  let c = setInterval(() => {
    countdown--
    if (countdown < 8) {
      handleProgress({status: `Scanner sleeping, run next scan in ${countdown}`})
    }

    if (countdown == 1) {
      clearInterval(c)
    }
  }, 1000)

  setTimeout(() =>{
    main(args)
  }, 1000 * SCAN_INTERVAL)
}




