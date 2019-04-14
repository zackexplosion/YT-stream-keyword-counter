const CHARTDATA_CACHE_SECONDS = process.env.chartdata_CACHE_SECONDS || 300
const cache_middleware = require('apicache').middleware(`${CHARTDATA_CACHE_SECONDS} seconds`)
const utils = require('./utils')

const createSheet = function({label, data}) {
  const color = utils.getColorByLabel(label)
  return {
    fill: false,
    label,
    data,
    backgroundColor: color,
    borderColor: color,
  }
}

const config = {
  type: 'line',
  options: {
    maintainAspectRatio: false,
    responsive: false,
    tooltips: {
      mode: 'index',
      intersect: false,
    },
    hover: {
      mode: 'nearest',
      intersect: true
    },
    scales: {
      xAxes: [{
        display: true,
      }],
      yAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: '次数'
        }
      }]
    }
  }
}

function computeChartData(channel, KEYWORDS) {
  let ranges = 6

  // filter out of range data
  let matches = db.get(channel.id).value().filter(m => {
    let a = moment(m[0])
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
      let t = moment(m[0])

      // Is in current time range?
      if (!t.isBetween(a,b)) return

      // log(t, a.format(), b.format(), t.isBetween(a,b))
      // Counte by the keywords
      KEYWORDS.forEach(k => {
        // is matched and between the time range
        if (m[1].indexOf(k) != -1) sheets[k][i]++
      })
    })
  }

  return {
    data: {
      labels: x.reverse().map(x =>{
        return moment(x).format('MM/DD LT')
      }),
      datasets: Object.keys(sheets).map(k =>{
        return createSheet({label: k, data: sheets[k]})
      })
    },
    options: {
      title: utils.createTitle(channel)
    }
  }
}

module.exports = {
  name: '最近6小時',
  size: '12',
  className: 'recents',
  url: '/chartdata-recents/:id?',
  middlewares: [cache_middleware],
  computeChartData, config
}
