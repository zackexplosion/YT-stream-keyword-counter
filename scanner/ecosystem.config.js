var path = require('path')
var channels = require(path.join('..', 'util', 'channels'))

var app = {
  name: "scanner",
  script: "index.js",
  ignore_watch: ["node_modules", "*.json", '*.png'],
  watch: ['*.js'],
  env: {
    "NODE_ENV": "production",
    "WEB_HOST": 'http://localhost:3000',
  }
}

var scanners = channels.map(c => {
  let { id, name , vid} =c
  return Object.assign({}, app, {
    name: `${app.name}-${name}`,
    env: {
      ...app.env,
      EVENT_TOKEN: vid + '-' + process.env.EVENT_TOKEN,
      YOUTUBE_VIDEO_ID: vid
    }
  })
})

// console.log(scanners)

module.exports = {
  apps: scanners
}