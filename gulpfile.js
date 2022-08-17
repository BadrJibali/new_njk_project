const gulp =require('gulp'),
      nunjucksRender = require('gulp-nunjucks-render'),
      data = require('gulp-data'),
      sass = require('gulp-sass')(require('sass')),
      autoprefixer = require('gulp-autoprefixer');
      cleanCSS = require('gulp-clean-css'),
      beautifyCode = require('gulp-beautify-code'),
      concat = require('gulp-concat'),
      sourcemaps = require('gulp-sourcemaps'),
      rename = require("gulp-rename"),
      livereload = require('gulp-livereload'),
      rtlcss = require('gulp-rtlcss'),
      uglify = require('gulp-uglify'),
      strip = require('gulp-strip-comments'),
      { series, parallel } = require('gulp');


// src paths
const srcPath = {
  html: 'src/templates/pages/**/*.+(html|njk)',
  scss: 'src/scss/**/*.scss',
  js: 'src/js/**/*.js',
  img: 'src/assets/images/**/*.*',
  fontsIcons: 'src/assets/fonts_icons/**/*.*',
  rtlCss: 'dist/css/**/all.css',
  data: './src/data/data.json',
  njk: 'src/templates',
  assets: {
    css: 'src/assets/libs/**/*.css'
  }
}

// dist paths
const distPath = {
  html: 'dist',
  css: 'dist/css',
  js: 'dist/js',
  imgs: 'dist/imgs',
  fontsIcons: 'dist/fonts_icons'
}

// =====================================================
// ===================( HTML Task )=====================
// =====================================================
function html() {
  return gulp.src([srcPath.html])
          .pipe(data(function() {
            return require(srcPath.data)
          }))
          .pipe(nunjucksRender({
            path: [srcPath.njk]
          }))
          .pipe(beautifyCode({
            indent_size: 2,
            indent_char: ' ',
            max_preserve_newlines: 0,
            unformatted: ['code', 'pre', 'em', 'strong', 'span', 'i', 'b', 'br']
          }))
          .pipe(strip())
          .pipe(gulp.dest(distPath.html))
          .pipe(livereload())
}


// =====================================================
// =============( Concat CSS assets libs )==============
// =====================================================
var separator = '\n\n/*====================================*/\n\n';
function copyCss() {
  return gulp.src([srcPath.assets.css])
          .pipe(sourcemaps.init())
          .pipe(concat('libs.css', {newLine: separator}))
          .pipe(beautifyCode({
            indent_size: 2,
            indent_char: ' ',
            max_preserve_newlines: 0,
            unformatted: ['code', 'pre', 'em', 'strong', 'span', 'i', 'b', 'br']
          }))
          .pipe(sourcemaps.write('.'))
          .pipe(gulp.dest( distPath.css+'/libs' ))
          .pipe(livereload())
}


// =====================================================
// ===================( SCSS Task )=====================
// =====================================================
function css() {
  return gulp.src([srcPath.scss])
          .pipe(sourcemaps.init())
          .pipe(sass().on('error', sass.logError))
          .pipe(autoprefixer())
          .pipe(concat('custom.css'))
          .pipe(beautifyCode({
            indent_size: 2,
            indent_char: ' ',
            max_preserve_newlines: 0,
            unformatted: ['code', 'pre', 'em', 'strong', 'span', 'i', 'b', 'br']
          }))
          .pipe(sourcemaps.write('.'))
          .pipe(gulp.dest(distPath.css+'/custom'))
          .pipe(livereload())
}


// =====================================================
// ================( Concat CSS Task )==================
// =====================================================
var separator = '\n\n/*====================================*/\n\n';
function concatCss() {
  return gulp.src([ distPath.css +'/libs/*.css', distPath.css +'/custom/*.css'])
          .pipe(sourcemaps.init({ loadMaps: true, largeFile: true }))
          .pipe(concat('all.css', {newLine: separator}))
          .pipe(beautifyCode({
            indent_size: 2,
            indent_char: ' ',
            max_preserve_newlines: 0,
            unformatted: ['code', 'pre', 'em', 'strong', 'span', 'i', 'b', 'br']
          }))
          .pipe(gulp.dest( distPath.css ))
          .pipe(cleanCSS())
          .pipe(rename({ extname: '.min.css' }))
          .pipe(sourcemaps.write('.'))
          .pipe(gulp.dest( distPath.css ))
          .pipe(livereload())
}



// =====================================================
// ==================( CSS RTL Task )===================
// =====================================================
function rtlCss() {
  return gulp.src([ distPath.css +'/all.css' ])
          .pipe(sourcemaps.init())
          .pipe(rtlcss())
          .pipe(rename({ extname: '.rtl.css' }))
          .pipe(gulp.dest(distPath.css +'/rtl'))
          .pipe(cleanCSS())
          .pipe(rename({ extname: '.min.css' }))
          .pipe(sourcemaps.write('.'))
          .pipe(gulp.dest(distPath.css +'/rtl'))
          .pipe(livereload())
}



// =====================================================
// ================( JavaScript Task )==================
// =====================================================
var separator = '\n\n/*====================================*/\n\n';
function js() {
  return gulp.src([srcPath.js])
          .pipe(concat('all.js', {newLine: separator}))
          .pipe(beautifyCode({
            indent_size: 2,
            indent_char: ' ',
            max_preserve_newlines: 0,
            unformatted: ['code', 'pre', 'em', 'strong', 'span', 'i', 'b', 'br']
          }))
          .pipe(gulp.dest(distPath.js))
          .pipe(uglify())
          .pipe(rename({ extname: '.min.js' }))
          .pipe(gulp.dest(distPath.js))
          .pipe(livereload())
}


// =====================================================
// ==================( Images copy )====================
// =====================================================
function imgCopy() {
  return gulp.src([srcPath.img])
          .pipe(gulp.dest(distPath.imgs))
          .pipe(livereload())
}


// =====================================================
// ===============( fonts_&_icons copy )================
// =====================================================
function fontsIcons() {
  return gulp.src([srcPath.fontsIcons])
          .pipe(gulp.dest(distPath.fontsIcons))
          .pipe(livereload())
}


exports.default = function () {
  require('./server.js');
  livereload.listen();
  gulp.watch([ srcPath.html, srcPath.scss, srcPath.js ], series( [html, copyCss, css, concatCss, rtlCss, js, imgCopy, fontsIcons] ) )
}