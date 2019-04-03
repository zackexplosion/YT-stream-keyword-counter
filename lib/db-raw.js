const DB_PATH = process.env.DB_RAW_PATH || 'db-raw.json'
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync(DB_PATH)
const db = low(adapter)
db.defaults({ raws: [] }).write()

module.exports = db