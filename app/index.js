const db = require('../lib/db')
const db_raw = require('../lib/db-raw')
const moment = require('moment-timezone')
moment.locale('zh-tw')
moment.tz.setDefault('Asia/Taipei')

function handleProgress (info) {
  if (!info.status) return
  console.log(moment().format('LTS'), info)
}