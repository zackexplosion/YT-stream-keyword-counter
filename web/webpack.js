
// only on dev mode
if ( process.env.NODE_ENV != 'development' ){
  return function(){}
}

const webpack = require('webpack');
const middleware = require('webpack-dev-middleware')
const compiler = webpack(require('./webpack.config'))

module.exports = app => {
  app.use(middleware(compiler, {
    // webpack-dev-middleware options
  }))
}



