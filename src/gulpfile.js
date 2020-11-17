const browserify = require('browserify');
const gulp = require('gulp');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const pug = require('gulp-pug');
const sass = require('gulp-sass');
require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const terser = require('gulp-terser');
const rename = require('gulp-rename');
const touch = require('gulp-touch-fd');
const fs = require('fs');

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
    watchSrc: ['./pug/**/*'],
    data: { config: './pug/config.json' },
    dest: `${OUTPUT_DIR}`,
  },
  styles: {
    src: './sass/**/*.scss',
    watchSrc: [
      './sass/**/*.scss',
      './package-lock.json',
    ],
    dest: `${OUTPUT_DIR}/assets/css`,
  },
  scripts: {
    src: './js/**/*.js',
    watchSrc: [
      './js/**/*.js',
      './package-lock.json',
    ],
    dest: `${OUTPUT_DIR}/assets/js`,
  },
  dependencies: {
    additionalPackages: [
      // packages that are not in package.json dependencies,
      // but that should be included (e.g. packages from devDependencies)
    ],
    excludePackages: [
      // packages that are in package.json dependencies,
      // but that should be excluded (e.g. packages that just provide fonts or css)
      'typeface-roboto',
    ],
    watchSrc: [
      './package-lock.json',
    ],
    dest: `${OUTPUT_DIR}/assets/js`,
  },
  styleDependencies: {
    src: [
      './sass/dependencies.scss',
    ],
    watchSrc: [
      './sass/dependencies.scss',
      './package-lock.json',
    ],
    dest: `${OUTPUT_DIR}/assets/css`,
  },
  fonts: {
    src: './node_modules/typeface-roboto/**/*',
    dest: `${OUTPUT_DIR}/assets/fonts/typeface-roboto`,
  },
};

function html() {
  const loadJson = function (filename) {
    return JSON.parse(fs.readFileSync(filename));
  };
  const pugData = Object.fromEntries(Object.entries(paths.html.data)
    .map(([propName, filename]) => [propName, loadJson(filename)]));
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

function _styles({ src, dest }) {
  return gulp.src(src, {
      sourcemaps: true,
    })
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dest));
}

function styles() {
  return _styles(paths.styles);
}

function styleDependencies() {
  return _styles(paths.styleDependencies);
}

function getDependencyList() {
  const packageJSON = JSON.parse(fs.readFileSync('./package.json'));
  const packages = Object.keys(packageJSON.dependencies)
    .concat(paths.dependencies.additionalPackages)
    .filter(package => !paths.dependencies.excludePackages.includes(package));
  return packages;
}

function dependencies() {
  return browserify({
    debug: true,
  })
    .require(getDependencyList())
    .transform('babelify', {
      global: true,
      presets: ['@babel/preset-env'],
      sourceMaps: true,
    })
    .bundle()
    .pipe(source('dependencies.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(terser())
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
    .external(getDependencyList())
    .transform('babelify', {
      plugins: ['@babel/plugin-proposal-nullish-coalescing-operator'],
      presets: [['@babel/preset-env', { useBuiltIns: 'usage', corejs: 3 }]],
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
    .pipe(terser({ keep_fnames: true }))
    .pipe(rename(`${JS_BUNDLE_NAME}.min.js`))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.scripts.dest));
}

function fonts() {
  return gulp.src(paths.fonts.src)
    .pipe(gulp.dest(paths.fonts.dest));
}

function watch() {
  gulp.watch(paths.styleDependencies.watchSrc || paths.styleDependencies.src, styleDependencies);
  gulp.watch(paths.styles.watchSrc || paths.styles.src, styles);
  gulp.watch(paths.dependencies.watchSrc || paths.dependencies.src, dependencies);
  gulp.watch(paths.scripts.watchSrc || paths.scripts.src, scripts);
  gulp.watch(paths.html.watchSrc || paths.html.src, html);
  gulp.watch(paths.fonts.watchSrc || paths.fonts.src, fonts);
}

const build = gulp.parallel(html, styleDependencies, styles, dependencies, scripts, fonts);

exports.dependencies = dependencies;
exports.styleDependencies = styleDependencies;
exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.watch = watch;

exports.build = build;
exports.default = build;
