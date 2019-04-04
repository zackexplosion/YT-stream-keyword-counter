const PORT = 8082
module.exports = function (shipit) {
  require('shipit-deploy')(shipit)

  shipit.initConfig({
    default: {
      workspace: '/tmp/github-monitor',
      deployTo: '/app/cti-hant-counter-crawler',
      repositoryUrl: 'https://github.com/zackexplosion/hant-counter-crawler',
    },
    production: {
      servers: 'zack@YEE'
    }
  })

  shipit.on('deployed', async function () {
    try {
      // await shipit.remote(`cd ${shipit.currentPath} && nvm use && yarn --production`)
      // await shipit.remote(`cd ${shipit.currentPath} && nvm use && npm install --production`)
    } catch (error) {
      console.log(error)
    }
    shipit.start('startApp')
  })

  shipit.task('startApp', async () => {
    const name = 'cti-hant-counter-crawler'
    const current_path = `${shipit.config.deployTo}/current`
    try {
      // let cmd = `
      const KEYWORDS = '韓|國瑜|韓國瑜|賣菜郎'
      const cmd = `TARGET_KEYWORDS='${KEYWORDS}' DB_RAW_PATH=${shipit.config.deployTo}/db-raw.json DB_PATH=${shipit.config.deployTo}/db.json PORT=${PORT} pm2 start ${current_path}/app/index.js --name ${name}`
      await shipit.remote(cmd)
    } catch (error) {
      await shipit.remote(`pm2 restart ${name}`)
    }
  })
}