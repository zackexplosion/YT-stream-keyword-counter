module.exports = function (shipit) {
  require('shipit-deploy')(shipit)

  shipit.initConfig({
    default: {
      workspace: '/tmp/github-monitor',
      deployTo: '/app/cti-hant-counter-crawler',
      repositoryUrl: 'https://github.com/zackexplosion/hant-counter-crawler',
      keepReleases: 2,
    },
    production: {
      servers: 'zack@YEE'
    }
  })

  shipit.on('deployed', async function () {
    shipit.start('checkDep')
    shipit.start('startApp')
  })

  shipit.task('checkDep', async () => {
    try {
      let list = (await shipit.remote(`ls ${shipit.config.deployTo}/releases`))[0]
                .stdout
                .trim()
                .split('\n')
                .map(n => parseInt(n))
      if (list.length > 1) {
        // copy last node_modules
        let last = list[list.length - 2]
        // let current = list[list.length - 1]
        // console.log(last)
        let cmd = [
          `cp -a ${shipit.config.deployTo}/releases/${last}/node_modules`,
          `${shipit.config.deployTo}/current/`
        ].join(' ')
        console.log(cmd)
        await shipit.remote(cmd)
      }

      await shipit.remote(`cd ${shipit.currentPath} && nvm use && yarn --production`)
    } catch (error) {
      console.log(error)
    }
  })

  shipit.task('startApp', async () => {
    try {
      const cmd = `cd ${shipit.config.deployTo} && pm2 start ecosystem.config.js`
      await shipit.remote(cmd)
    } catch (error) {
      await shipit.remote(`cd ${shipit.config.deployTo} && pm2 restart ecosystem.config.js`)
    }
  })
}