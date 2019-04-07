const path = require('path')

// rerquire common
require(path.join(__dirname, '..', 'util', 'common'))

function getDate (d) {
  return moment(d, ["YYYY年MM月DD日 hh:mm:ss"])
}

// old db
const old_db = require(path.join(__dirname, 'db'))

// setup new db
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db-cti.json')
const newdb = low(adapter)

let defaults = {}
require(path.join(ROOT_DIR, 'util', 'channels')).forEach(c =>{
  if(c.scan === false) return
  defaults[c.id] = []
})

newdb.defaults(defaults).write()

let new_data = old_db.get('matches').value().map(v => {
  let r =  [getDate(v.created_at), v.matches]

  newdb.get('cti').push(r).write()
  return r
})


log(new_data)