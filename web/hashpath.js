const fs = require('fs')
const path = require('path')
const glob = require("glob")

function hashPath (file) {
  let { name, ext } = path.parse(file)

  let files = glob.sync(path.join(__dirname, 'dist', `${name}-*${ext}`), {})
  if (files.length == 1) {
    let { base } = path.parse(files[0])
    return '/' + base
  } else {
    throw 'assets not found'
  }
}

module.exports = app => {
  app.locals.hashPath = hashPath
}