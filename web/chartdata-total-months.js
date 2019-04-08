const KEYWORDS = (process.env.TARGET_KEYWORDS || '韓|國瑜|韓國瑜').split('|')
const CHARTDATA_CACHE_SECONDS = process.env.chartdata_CACHE_SECONDS || 60 * 60
const path = require('path')
const CHANNELS = require(path.join(ROOT_DIR, 'util', 'channels'))
const cache_middleware = require('apicache').middleware(`${CHARTDATA_CACHE_SECONDS} seconds`)

function countchartdata(channel) {
  const startTime = moment('2019-04-07T13:27:12.791Z')
  let matches = db.get(channel.id).value().filter(m => {
    let a = moment(m[0])
    const startOfMonth = moment().startOf('month')
    const endOfMonth   = moment().endOf('month')
    return a > startTime && a > startOfMonth && a < endOfMonth
  })

  let data = {}

  KEYWORDS.forEach(k => {
    data[k] = 0
  })

  matches.forEach(m => {
    KEYWORDS.forEach(k => {
      // is matched and between the time range
      if (m[1].indexOf(k) != -1) data[k]++
    })
  })

  // log(matches)

  return {
    data,
    create_time: moment()
  }
}

// let chartdata = countchartdata()
module.exports = app => {
  app.get('/chartdata-total-months/:id?', cache_middleware , (req, res) => {
    const { id } = req.params
    const channel = CHANNELS.find(c => c.id == id)
    if (!channel) return res.json([])

    let chartdata = countchartdata(channel)
    return res.json(chartdata)
  })
}

