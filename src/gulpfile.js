const browserify = require('browserify');
const gulp = require('gulp');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const pug = require('gulp-pug');
const sass = require('gulp-sass');
require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const touch = require('gulp-touch-fd');
const pugData = require('./pug/data.js');

const OUTPUT_DIR = '..';

const JS_BUNDLE_NAME = 'bundle';

const paths = {
  html: {
    src: [
      './pug/**/*.pug',
      '!./pug/include/**/*.pug',
      '!./pug/tpl/**/*.pug',
      '!./pug/sections/**/*.pug',
    ],
    watchSrc: ['./pug/**/*.pug'],
    dest: `${OUTPUT_DIR}`,
  },
  styles: {
    src: './sass/**/*.scss',
    dest: `${OUTPUT_DIR}/assets/css`,
  },
  scripts: {
    src: './js/*.js',
    dest: `${OUTPUT_DIR}/assets/js`,
  },
  dependencies: {
    packages: ['d3'],
    dest: `${OUTPUT_DIR}/assets/js`,
  },
  fonts: {
    src: './node_modules/typeface-roboto/**/*',
    dest: `${OUTPUT_DIR}/assets/fonts/typeface-roboto`,
  },
};

function html() {
  return gulp.src(paths.html.src)
    .pipe(pug({
      pretty: true,
      data: pugData,
    })).pipe(rename({
      extname: '.html',
    })).pipe(
      gulp.dest(paths.html.dest)
    )
    .pipe(touch());
}

function styles() {
  return gulp.src(paths.styles.src, {
    sourcemaps: true,
  })
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.styles.dest));
}

function dependencies() {
  return browserify({
    debug: true,
  })
    .require(paths.dependencies.packages)
    .transform('babelify', {
      presets: ['@babel/preset-env'],
      sourceMaps: true,
    })
    .bundle()
    .pipe(source('dependencies.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(uglify())
    .pipe(rename('dependencies.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.dependencies.dest));
}

function scripts() {
  return browserify({
    extensions: ['.js', '.jsx'],
    entries: './js/main.js',
    debug: true,
  })
    .external(paths.dependencies.packages)
    .transform('babelify', {
      presets: ['@babel/preset-env'],
      sourceMaps: true,
    })
    .on('error', (msg) => {
      // eslint-disable-next-line no-console
      console.error(msg);
    })
    .bundle()
    .pipe(source(`${JS_BUNDLE_NAME}.js`))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(uglify({ keep_fnames: true }))
    .pipe(rename(`${JS_BUNDLE_NAME}.min.js`))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.scripts.dest));
}

function fonts() {
  return gulp.src(paths.fonts.src)
    .pipe(gulp.dest(paths.fonts.dest));
}

function watch() {
  gulp.watch(paths.styles.watchSrc || paths.styles.src, styles);
  gulp.watch(paths.scripts.watchSrc || paths.scripts.src, scripts);
  gulp.watch(paths.html.watchSrc || paths.html.src, html);
  gulp.watch(paths.fonts.watchSrc || paths.fonts.src, fonts);
}

const build = gulp.parallel(html, styles, dependencies, scripts, fonts);

exports.dependencies = dependencies;
exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.watch = watch;

exports.build = build;
exports.default = build;
