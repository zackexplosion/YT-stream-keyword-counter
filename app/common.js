const path = require('path')

const BASE_DIR = __dirname
global.BASE_DIR = BASE_DIR
global.log = require(path.join(__dirname, '/log'))

const moment = require('moment-timezone')
moment.locale('zh-tw')
moment.tz.setDefault('Asia/Taipei')
global.moment = moment