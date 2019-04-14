
const CACHE_SECONDS = process.env.CHART_CACHE_MONTH_TOTAL || 60 * 60
const cache_middleware = require('apicache').middleware(`${CACHE_SECONDS} seconds`)
const utils = require('./utils')

var config = utils.configFactory({
  type: 'polarArea',
  options: {
    legend: {
      position: 'right',
    }
  }
})

function computeChartData(channel, KEYWORDS) {
  // This time is multi scanner deploy time, so the data before this moment should not compute
  const startTime = moment('2019-04-07T13:27:12.791Z')
  let matches = db.get(channel.id).value().filter(m => {
    // filter by record time
    let a = moment(m[0])

    const startOfMonth = moment().startOf('month')
    const endOfMonth   = moment().endOf('month')

    // make sure it's in this month and new than starTime
    return (
      a >= startTime &&
      a >= startOfMonth &&
      a <= endOfMonth
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
  name: '月累積',
  size: '6',
  className: 'month-total',
  middlewares: [cache_middleware],
  computeChartData, config
}

