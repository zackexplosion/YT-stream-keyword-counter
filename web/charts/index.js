const KEYWORDS = (process.env.TARGET_KEYWORDS || '韓|國瑜|韓國瑜').split('|')
const path = require('path')
const channels = require(path.join(ROOT_DIR, 'util', 'channels'))

function setupChannel(req, res, next) {
  const { id } = req.params
  const channel = channels.find(c => c.id == id && !c.skip)

  // return empty array when channel not found
  if (!channel) return res.json([])

  req.channel = channel
  return next()
}

const charts = ['recents', 'month-total', 'day-total']
// const charts = ['month-total']
module.exports = app => {
  var configs = []
  charts.forEach(c => {
    let {
      name,
      className,
      size,
      middlewares,
      computeChartData,
      config
    } = require(path.join(__dirname, c))

    configs.push({
      name, config, className, size
    })

    // log('main', main)

    middlewares.push(setupChannel)

    app.get(
      `/chartdata-${className}/:id?`,
      middlewares,
      function(req, res)
    {
      let chartdata = computeChartData(req.channel, KEYWORDS)
      return res.json(chartdata)
    })
  })

  app.get('/chart-configs', (req, res) => {
    return res.json(configs)
  })
}