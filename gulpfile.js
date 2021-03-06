/** 
 **** BASIC GULPFILE FOR GULP 4 ****
Author: César O. Araújo
Version: 1.0.0
**/

// IMPORTING MODULES
const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const  csslint = require('gulp-csslint');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const clean = require('gulp-clean');
const cssmin = require('gulp-cssmin');
const gulpIgnore = require('gulp-ignore');
const jshint = require('gulp-jshint');
const jshintStylish = require('jshint-stylish');
const rename = require('gulp-rename');
const usemin = require('gulp-usemin');
const image = require('gulp-image');


// TASK TO COMPILE SASS AND ADD CROSSBROWSERS PREFIXES
var sassFiles = './src/css/scss/*.scss';
var cssDest = './src/css';
var sassOptions = { outputStyle: 'compressed'}
var autoprefixerOptions = {browsers: ['last 2 versions'], cascade: false}

function compilaSass() {
  return gulp.src(sassFiles)
  .pipe(sass(sassOptions).on('error', sass.logError))
  .pipe(autoprefixer(autoprefixerOptions))
  .pipe(rename('style.min.css'))
  .pipe(gulp.dest(cssDest))
  .pipe(browserSync.stream())
}

gulp.task('sass', compilaSass);

// TASK TO CONCAT JS FILES AND FIX THE COMPATIBILITY OF ES6+
var jsFiles = 'src/js/mainjs/*.js';
var jsFileName = 'main.js';
var babelOptions = { presets: ['env'] };
var jsFileDest = './src/js';

function concatJS() {
  return gulp.src(jsFiles)
  .pipe(concat(jsFileName))
  .pipe(babel(babelOptions))
  .pipe(uglify())
  .pipe(gulp.dest(jsFileDest))
  .pipe(browserSync.stream());
}

gulp.task('concatjs', concatJS);

// TASK TO OPTIMIZE IMAGES
var imgSrc = './src/img/_img-full/*';
var imgDest = './src/img';

function imageJS() {
 return gulp.src(imgSrc)
  .pipe(image({
    pngquant: true,
    optipng: true,
    zopflipng: true,
    jpegRecompress: true,
    mozjpeg: true,
    guetzli: false,
    gifsicle: true,
    svgo: true,
    concurrent: 10,
    quiet: true
  }))
  .pipe(gulp.dest(imgDest));
}

gulp.task('image', imageJS);

// CLEAR THE DIST FOLDER BEFORE THE NEW COPY
function cleanJS() {
  return gulp.src('dist/*')
  .pipe(clean());
}

gulp.task('clean', cleanJS);

// CONCAT AND MINIFIES THE CSS AND JS FILES + CHANGE THE SRC ON HEADER/FOOTER
function useminJS() {
  return gulp.src('src/**/*.php')
  .pipe(usemin({
    path: './src/',
    'html': [function(){ return htmlmin({ collapseWhitespace: true, removeComments: true, includeAutoGeneratedTags: false, ignoreCustomFragments: [/<\?[\s\S]*?(?:\?>|$)/] })}],
    'js' : [uglify],
    'css' : [cssmin]
  }))
  .pipe(gulp.dest('dist'))
  .pipe(browserSync.stream())
}

gulp.task('usemin', useminJS);

// TASK TO COPY THE SRC FILES TO DIST (EXCEPTION: FILES THAT BEGINS WITH _ )
function copyJS() {
  return gulp.src(['src/**/*', '!src/**/_*', '!src/**/_*/**/*'])
  .pipe(gulp.dest('dist/'));
}

gulp.task('copy', gulp.series('clean', gulp.parallel('usemin', 'image', 'concatjs', 'sass'), copyJS));

// TASK TO INITIALIZE THE LIVE SERVER
function browser() {
  browserSync.init({
    server: {
      baseDir: "./src"
    }
  });
}

gulp.task('browser-sync', browser);

// WATCH TASK
function watch() {
  gulp.watch('./src/css/**/*.scss', compilaSass);
  gulp.watch('./src/js/mainjs/*.js', concatJS);
  gulp.watch(['./src/*.html']).on('change', browserSync.reload);
}

gulp.task('watch', watch);


// TYPE 'GULP' AND BE HAPPY
gulp.task('default', gulp.parallel('watch', 'copy', 'browser-sync'));
