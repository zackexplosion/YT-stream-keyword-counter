const KEYWORDS = (process.env.TARGET_KEYWORDS || '韓|國瑜|韓國瑜').split('|')
const SCAN_INTERVAL = parseInt(process.env.TARGET_KEYWORDS || 10)

module.exports = async function main (args) {
  const { db, db_raw, moment} = args
  var counter = db.get('counter').value()

  // screenshot from stream
  await require('./stream-to-image')(handleProgress)
  let r = await require('./image-to-text-and-grap')(handleProgress)
  var is_counter_updated = false
  KEYWORDS.forEach(k => {
    if (r.matches.indexOf(k) > 0) {
      is_counter_updated = true
      counter[k]++
    }
  })

  db.update('counter', counter).write()
  db.update('matches', r.matches).write()
  db_raw.update('raws', r.raws).write()

  if (is_counter_updated) {
    handleProgress({status: `Found keywords in : ${r.matches}`})
  } else {
    handleProgress({status: 'Counter not change.'})
  }

  let countdown = SCAN_INTERVAL
  let c = setInterval(() => {
    countdown--
    handleProgress({status: `sleeping, next scan in ${countdown}`})
    if(countdown == 1) {
      clearInterval(c)
    }
  }, 1000)

  setTimeout(main, 1000 * SCAN_INTERVAL)
}

main()




