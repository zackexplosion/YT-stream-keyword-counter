const path = require('path')
global.ROOT_DIR = path.join(__dirname, '..')
global.UTIL_DIR = path.join(__dirname)
global.log = require(path.join(__dirname, 'log'))

const moment = require(path.join(
  process.cwd(),
  'node_modules',
  'moment-timezone'
))
moment.locale('zh-tw')
moment.tz.setDefault('Asia/Taipei')
global.moment = moment
