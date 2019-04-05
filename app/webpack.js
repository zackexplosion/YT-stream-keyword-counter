
// only on dev mode
if ( process.env.NODE_ENV != 'development' ){
  return false
}

const webpack = require('webpack');
const middleware = require('webpack-dev-middleware')
const compiler = webpack({
  // webpack options
})

module.exports = app => {
  app.use(middleware(compiler, {
    // webpack-dev-middleware options
  }))
}



