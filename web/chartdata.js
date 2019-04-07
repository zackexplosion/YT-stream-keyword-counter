const KEYWORDS = (process.env.TARGET_KEYWORDS || '韓|國瑜|韓國瑜').split('|')
const CHARTDATA_CACHE_SECONDS = process.env.chartdata_CACHE_SECONDS || 300
const cache_middleware = require('apicache').middleware(`${CHARTDATA_CACHE_SECONDS} seconds`)

function getDate (d) {
  return moment(d, ["YYYY年MM月DD日 hh:mm:ss"])
}

function countchartdata() {
  let ranges = 24

  // let counted = db.get('counted').value()

  // filter out of range data
  let matches = db.get('matches').value().filter(m => {
    let a = getDate(m.created_at)
    let b = moment().subtract(ranges, 'hour').startOf('hour')
    return a > b
  })

  // log('matches', matches)

  let x = []
  let sheets = {}

  KEYWORDS.forEach(k => {
    sheets[k] = Array(ranges+1).fill(0)
  })

  // counter
  for (let i = 0; i <= ranges; i++){
    let a = moment().subtract(ranges - i, 'hour').startOf('hour')
    let b = moment().subtract(ranges - i -1, 'hour').startOf('hour')

    // create labels for x axis
    x.unshift(b)

    matches.forEach(m => {
      let t = getDate(m.created_at)

      // Is in current time range?
      if (!t.isBetween(a,b)) return

      // log(t, a.format(), b.format(), t.isBetween(a,b))
      // Counte by the keywords
      KEYWORDS.forEach(k => {
        // is matched and between the time range
        if (m.matches.indexOf(k) != -1) sheets[k][i]++
      })
    })
  }

  return {
    sheets,
    x,
    now: moment()
  }
}

// let chartdata = countchartdata()
module.exports = app => {
  app.get('/chartdata', cache_middleware , (req, res) => {
    let chartdata = countchartdata()
    return res.json(chartdata)
  })
}

