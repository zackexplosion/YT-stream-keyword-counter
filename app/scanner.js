const KEYWORDS = (process.env.TARGET_KEYWORDS || '韓|國瑜|韓國瑜').split('|')
const SCAN_INTERVAL = parseInt(process.env.SCAN_INTERVAL || 20)
const rimraf = require('rimraf')
const path = require('path')
var last_matched = ''
module.exports = async function main (args) {
  const { db, log, db_raw, handleProgress, moment} = args

  var scan_result
  try {
    // clear tmp dir
    await new Promise((resolve, reject) => {
      rimraf(path.join(BASE_DIR, '/tmp/*.png'), function(err){
        if (err) reject(err)
        resolve()
      })
    })

    // screenshot from stream
    await require(path.join(BASE_DIR, '/stream-to-image'))(handleProgress)

    // run OCR
    scan_result = await require(path.join(BASE_DIR, '/image-to-text-and-grap'))(handleProgress)
  } catch (error) {
    log(error)
  }

  const { matches , raws } = scan_result

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


  if (is_found_matches) {
    db.update('counter', counter).write()

    let created_at = moment().format('LL LTS')
    db.get('matches').push({
      created_at, matches
    }).write()

    db_raw.get('matches').push({
      created_at, raws
    }).write()

    handleProgress({created_at, counter, matches, status: 'update counter'})
  } else {
    handleProgress({status: 'Counter not changed.', matches})
  }

  var sleeping_counter = 0.1
  var c = setInterval(() => {
    sleeping_counter = sleeping_counter + 0.1

    if (sleeping_counter > 0.3) {
      handleProgress({status: `Scanner sleeping`, progress: sleeping_counter})
    }

    if (sleeping_counter >= (SCAN_INTERVAL/10) - 1) {
      clearInterval(c)
      // do next scan
      main(args)
    }

  }, 1000)

  // setTimeout(()=>{
  //   handleProgress({status: `Scanner sleeping`})
  // }, 1000 * 5)

  // setTimeout(()=>{
  //   // do next scan
  //   main(args)
  // }, 1000 * SCAN_INTERVAL)


}




