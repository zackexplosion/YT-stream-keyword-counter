const DB_PATH = process.env.DB_PATH || './'
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const path = require('path')
const CHANNELS = require(path.join(ROOT_DIR, 'util', 'channels'))


let databases = {}

CHANNELS.forEach(c =>{
  if (c.skip) return
  const _db = low(new FileSync(path.join(DB_PATH, `db-${c.id}.json`)))
  const defaults = {}
  defaults[c.id] = []
  _db.defaults(defaults).write()
  databases[c.id] = _db
})

module.exports = {
  get: function(id) {
    // log(id, databases)
    if (!databases[id]) throw `database "${id}" not found`
    return databases[id].get(id)
  }
}