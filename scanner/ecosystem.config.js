var channels = [
  // name, video id
  ['中天', 'wUPPkSANpyo'],
  ['TVBS', 'Hu1FkdAOws0'],
  ['三立', '4ZVUmEUFwaY'],
  ['東森', 'dxpWqjvEKaM'],
  ['民視', 'XxJKnDLYZz4']
]

var app = {
  name: "scanner",
  script: "./app/scanner-server.js",
  ignore_watch: ["node_modules", "*.json", '*.png'],
  watch: ['*.js'],
  env: {
    "NODE_ENV": "production",
    "WEB_HOST": 'http://localhost:3000',
  }
}

var scanners = channels.map(c => {
  let name = c[0]
  let vid = c[1]
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
    // {
    //   name: "cti-hant-counter-crawler",
    //   script: "./current/app/web-server.js",
    //   watch: true,
    //   ignore_watch: ["node_modules", "*.json"],
    //   env: {
    //     "NODE_ENV": "production",
    //     "EVENT_TOKEN": "WRYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY",
    //     "TARGET_KEYWORDS": "韓|國瑜|韓國瑜|韓粉|韓流|蔡英文|菜|拔菜|賣菜郎",
    //     "DB_PATH": "/app/cti-hant-counter-crawler/db.json",
    //     "DB_CHAT_PATH": "/app/cti-hant-counter-crawler/db-chat.json",
    //     "PORT": 8082
    //   }
    // }
}