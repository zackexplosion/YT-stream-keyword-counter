var path = require('path')
var channels = require(path.join('..', 'util', 'channels'))

var app = {
  name: "scanner",
  script: "index.js",
  ignore_watch: ["node_modules", "*.json", '*.png'],
  watch: ['*.js'],
  env: {
    "NODE_ENV": "production",
    "WEB_HOST": process.env.WEB_HOST,
  }
}
var scanners = []
channels.forEach(c => {
  const { id, vid, skip} = c

  // channel skip with this attribute
  if (skip) return false

  scanners.push(
    Object.assign({}, app, {
      name: `${app.name}-${id}`,
      env: {
        ...app.env,
        ACCESS_TOKEN: id + '-' + process.env.SCANNER_TOKEN,
        YOUTUBE_VIDEO_ID: vid
      }
    })
  )
})



// console.log(scanners)

module.exports = {
  apps: scanners
}