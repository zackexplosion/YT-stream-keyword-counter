module.exports = function (shipit) {
  require('shipit-deploy')(shipit)

  shipit.initConfig({
    default: {
      workspace: '/tmp/github-monitor',
      deployTo: '/app/cti-hant-counter-crawler',
      repositoryUrl: 'https://github.com/zackexplosion/hant-counter-crawler',
      keepReleases: 1,
    },
    production: {
      servers: 'zack@YEE'
    }
  })

  shipit.on('deployed', async function () {
    try {
      await shipit.remote(`cd ${shipit.currentPath} && nvm use && yarn --production`)
    } catch (error) {
      console.log(error)
    }
    shipit.start('startApp')
  })

  shipit.task('startApp', async () => {
    const name = 'cti-hant-counter-crawler'
    // const current_path = `${shipit.config.deployTo}/current`
    try {
      const cmd = `pm2 start echosystem.config.js`
      await shipit.remote(cmd)
    } catch (error) {
      await shipit.remote(`pm2 restart system.config.js`)
    }
  })
}