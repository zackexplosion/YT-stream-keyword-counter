const { watch, src, dest, series, parallel } = require('gulp')
const sass = require('gulp-sass')
const minifyCSS = require('gulp-csso')
const sourcemaps = require('gulp-sourcemaps')
const nodemon = require('gulp-nodemon')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const webpackStream = require('webpack-stream')
const browserSync = require('browser-sync').create()
const path = require('path')
const webpack_param = {
  mode: process.env.NODE_ENV,
  entry: {
    app: `./js/app.js`,
    chat: `./js/chat.js`,
  },
  output: {
    filename: '[name]-[chunkhash].js',
    // filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new CleanWebpackPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        ]
      }
    ]
  }
}

function webpack () {
  return src('./js/app.js')
    .pipe(webpackStream(webpack_param))
    .pipe(dest('dist'))
    .pipe(browserSync.stream())
}

function css() {
  return src('sass/*.sass')
    // .pipe(sourcemaps.init())
    .pipe(sourcemaps.init())
    .pipe(sass())
    // .pipe(sourcemaps.write('./maps'))
    .pipe(minifyCSS())
    .pipe(sourcemaps.write('.'))
    .pipe(dest('dist'))
    .pipe(browserSync.stream())
}

const build = parallel(css, webpack)
function startNodemon (cb) {
  nodemon({
    script: 'index.js',
    ext: '*.js',
    ignore : [
      'gulpfile.js',
      "js/**",
      "dist/**",
      "tmp/**",
      "public/**",
      "views/**"
    ],
    stdout: false,
  })
  .on('stdout', function (stdout) {
    // print origin stdout
    console.log(stdout.toString())

    // check if app ready
    const isReady = stdout.toString().includes('serving')

    if (!isReady) { return }
    cb()
  })
  .on('restart', () => {
    browserSync.reload()
  })
  .on('stderr', (err) =>{
    console.log(err.toString())
  })

}

function startBrowserSync (cb) {
  const PORT = parseInt(process.env.PORT) || 3000
  browserSync.init({
    proxy: `http://localhost:${PORT}`,
    ws: true,
    port: PORT+1
  }, cb)
}


function watcher (cb) {
  watch(['./views/*.pug']).on('change', browserSync.reload)
  watch(['./sass/*.sass'], css)
  watch(['./js/*.js'], webpack)
  cb()
}

// exports.js = js
exports.build = build
// exports.default = build
exports.default = series(
  build,
  startNodemon,
  startBrowserSync,
  watcher
)