const DB_PATH = process.env.DB_PATH || 'db.json'
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync(DB_PATH)
const db = low(adapter)

// let defaults = {}
// channels.forEach(c =>{
//   if(c.scan === false) return
//   defaults[c.id] = []
// })

// db.defaults(defaults).write()
global.db = db
module.exports = db