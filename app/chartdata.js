const KEYWORDS = (process.env.TARGET_KEYWORDS || '韓|國瑜|韓國瑜').split('|')
// const db_raw = require('./db-raw')
const randomColor = () => {
  var letters = '0123456789ABCDEF'
  var color = '#'
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

const getDate = d =>{
  return moment(d, ["YYYY年MM月DD日 hh:mm:ss"])
}
var chartdata = null
module.exports = function (req, res) {
  if (chartdata && moment.duration(getDate(chartdata.now).diff(moment()) > moment.duration(5, 'minutes') )) {
    return res.json(chartdata)
  }
  // let keywords = Object.keys(db.get('counter').value())
  let ranges = 6
  // filter out of range data
  let matches = db.get('matches').value().filter(m => {
    let a = getDate(m.created_at)
    let b = moment().subtract(ranges, 'hour').startOf('hour')
    return a > b
  })

  // log(matches)
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
          if(!sheets[k]) sheets[k] = {
            data: Array(ranges+1).fill(0),
            borderWidth: 3,
            borderColor: randomColor(),
            label: k
          }
          sheets[k].data[i]++
        }
        if (t.isBetween(a,b)) {
          data[i]++
        }
      })
    })

    x.unshift(b.format('LT'))
  }

  let now = moment().format('lll')

  chartdata = {
    sheets,
    data,
    x,
    now
  }
  res.json(chartdata)
}