const { watch, src, dest, parallel } = require('gulp')
const sass = require('gulp-sass')
const minifyCSS = require('gulp-csso')
const sourcemaps = require('gulp-sourcemaps')
const livereload = require('gulp-livereload')
const nodemon = require('gulp-nodemon')
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpackStream = require('webpack-stream')
const path = require('path')
const webpack_param = {
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
}

// function js() {
//   return src([
//       'js/app.js',
//       'js/chat.js',
//     ])
//     .pipe(sourcemaps.init())
//     .pipe(sourcemaps.write('.'))
//     .pipe(dest('dist'))
// }

var build = parallel(css, webpack)

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
  livereload.listen()
  build()

  watch(['./sass/*.sass'], css)
  watch(['./js/*.js'], webpack)
  cb()
}

// exports.js = js
exports.build = build
// exports.default = build
exports.default = watcher