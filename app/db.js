const KEYWORDS = (process.env.TARGET_KEYWORDS || '韓|國瑜|韓國瑜').split('|')
const DB_PATH = process.env.DB_PATH || 'db.json'
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync(DB_PATH)
const db = low(adapter)
// init counter
let counter = {}
KEYWORDS.forEach(k => {
  counter[k] = 0
})
db.defaults({ counter, matches: [] }).write()
global.db = db
module.exports = db