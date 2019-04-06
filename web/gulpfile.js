const { watch, src, dest, parallel } = require('gulp')
const sass = require('gulp-sass')
const minifyCSS = require('gulp-csso')
const concat = require('gulp-concat')
const sourcemaps = require('gulp-sourcemaps')
const livereload = require('gulp-livereload')
const nodemon = require('gulp-nodemon')

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

function js() {
  return src('js/*.js')
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write('.'))
    .pipe(dest('dist'))
}

var build = parallel(css, js)

function watcher (cb) {
  nodemon({
    script: 'index.js',
    ext: '*.js',
    ignore : [
      "dist/**",
      "tmp/**",
      "public/**",
      "views/**"
    ],
  })
  livereload.listen()
  build()

  watch(['./sass/*.sass'], css)
  watch(['./js/*.js'], js)
  cb()
}

// exports.js = js
exports.build = build
// exports.default = build
exports.default = watcher