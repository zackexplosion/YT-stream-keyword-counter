module.exports = function (shipit) {
  require('shipit-deploy')(shipit)
  require('shipit-assets')(shipit)
  const deployTo = '/app/cti-hant-counter-crawler'
  shipit.initConfig({
    default: {
      workspace: '/tmp/github-monitor',
      deployTo,
      repositoryUrl: 'https://github.com/zackexplosion/hant-counter-crawler',
      keepReleases: 2,
      assets: {
        remoteBasePath: `${deployTo}/current/web`,
        paths: ['dist'],
      }
    },
    production: {
      servers: 'zack@YEE'
    }
  })

  shipit.on('deployed', async function () {
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
          `cp -a ${shipit.config.deployTo}/releases/${last}/web/node_modules`,
          `${shipit.config.deployTo}/current/web`
        ].join(' ')
        console.log(cmd)
        await shipit.remote(cmd)
      }

      await shipit.remote(`cd ${shipit.currentPath}/web && nvm use && yarn --production`)
      await shipit.local('yarn build')
      await shipit.start('assets:push')
    } catch (error) {
      console.log(error)
    }
    await shipit.start('startApp')
  })

  // shipit.task('checkDep', async () => {

  // })

  shipit.task('pulldb', async () => {
    try {
      await shipit.local(`scp YEE:${process.env.PROD_DB_PATH}* .`)
    } catch (error) {
      console.log(error)
    }
  })

  shipit.task('startApp', async () => {
    const cmd = `cd ${shipit.config.deployTo}/current/web && pm2 restart ${shipit.config.deployTo}/web.config.js`
    try {
      await shipit.remote(cmd)
    } catch (error) {
      console.log(error)
      // await shipit.remote(`cd ${shipit.config.deployTo} && pm2 restart ecosystem.config.js`)
    }
  })
}