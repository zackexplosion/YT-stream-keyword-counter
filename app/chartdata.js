const KEYWORDS = (process.env.TARGET_KEYWORDS || '韓|國瑜|韓國瑜').split('|')
const CHARTDATA_CACHE_SECONDS = process.env.CHARTDATA_CACHE_SECONDS || 30
function getDate (d) {
  return moment(d, ["YYYY年MM月DD日 hh:mm:ss"])
}

function countChartData() {
  let ranges = 6
  // filter out of range data
  let matches = db.get('matches').value().filter(m => {
    let a = getDate(m.created_at)
    let b = moment().subtract(ranges, 'hour').startOf('hour')
    return a > b
  })

  let x = []
  let data = []
  let sheets = {}

  // counter
  for (let i = 0; i <= ranges; i++){
    let a = moment().subtract(ranges - i, 'hour').startOf('hour')
    let b = moment().subtract(ranges - i -1, 'hour').startOf('hour')
    data[i] = 0

    KEYWORDS.forEach(k => {
      matches.forEach(m =>{
        let t = getDate(m.created_at)
        // log('t', t.format('lll'), 'is between?', a.format('lll'), b.format('lll'), t.isBetween(a,b))
        // log(m.matches, k, m.matches.indexOf(k))
        if (m.matches.indexOf(k) != -1 && t.isBetween(a,b)) {
          if(!sheets[k]) {
            sheets[k] = Array(ranges+1).fill(0)
          }
          sheets[k][i]++
        }
        if (t.isBetween(a,b)) {
          data[i]++
        }
      })
    })

    x.unshift(b.format('LT'))
  }

  let now = moment().format('lll')

  return {
    sheets,
    x,
    now
  }
}


var chartData = null
module.exports = function (req, res) {
  // cache
  if (chartData &&
      moment.duration(getDate(chartData.now).diff(moment()) >
      moment.duration(CHARTDATA_CACHE_SECONDS, 'seconds') )
  ) {
    return res.json(chartData)
  }

  chartData = countChartData()
  res.json(chartData)
}