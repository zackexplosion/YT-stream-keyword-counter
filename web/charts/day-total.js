
const CACHE_SECONDS = process.env.CHART_CACHE_MONTH_TOTAL || 60 * 60
const cache_middleware = require('apicache').middleware(`${CACHE_SECONDS} seconds`)
const utils = require('./utils')

var config = utils.configFactory({
  type: 'pie',
  options: {
    legend: {
      position: 'right',
    }
  }
})

function computeChartData(channel, KEYWORDS) {
  let matches = db.get(channel.id).value().filter(m => {
    // filter by record time
    let a = moment(m[0])

    const startOfDay = moment().startOf('day')
    const endOfDay   = moment().endOf('day')

    // make sure it's in this month and new than starTime
    return (
      a >= startOfDay &&
      a <= endOfDay
    )
  })

  let data = {}
  let backgroundColor = []
  // setup defaults by key
  KEYWORDS.forEach(k => {
    data[k] = 0
    backgroundColor.push(utils.getColorByLabel(k))
  })

  // compute
  matches.forEach(m => {
    KEYWORDS.forEach(k => {
      // is matched and between the time range
      if (m[1].indexOf(k) != -1) data[k]++
    })
  })

  // format data for chart
  let result = {
    data: {
      labels: KEYWORDS
    },
    options: {
      title: utils.createTitle(channel)
    }
  }

  result.data.datasets = [{
    backgroundColor,
    data: Object.keys(data).map(k => {
      return data[k]
    })
  }]

  return result
}

module.exports = {
  name: '日累積',
  size: '6',
  className: 'day-total',
  middlewares: [cache_middleware],
  computeChartData, config
}

