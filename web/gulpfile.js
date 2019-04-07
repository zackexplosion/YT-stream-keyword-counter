const { watch, src, dest, series, parallel } = require('gulp')
const sass = require('gulp-sass')
const minifyCSS = require('gulp-csso')
const sourcemaps = require('gulp-sourcemaps')
const nodemon = require('gulp-nodemon')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const webpackStream = require('webpack-stream')
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
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
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

const browserSync = require('browser-sync').create()

function watcher (cb) {
  nodemon({
    script: 'index.js',
    ext: '*.js',
    ignore : [
      "js/**",
      "dist/**",
      "tmp/**",
      "public/**",
      "views/**"
    ],
  })
  .on('start', () => {
    const PORT = parseInt(process.env.PORT) || 3000
    browserSync.init({
      proxy: `http://localhost:${PORT}`,
      port: PORT+1
    })
  })

  watch(['./**/*.pug'], browserSync.reload)
  watch(['./sass/*.sass'], css)
  watch(['./js/*.js'], webpack)
  cb()
}

// exports.js = js
exports.build = build
// exports.default = build
exports.default = series(build, watcher)