const path = require('path');
const fs = require('fs');
const gulp = require('gulp');
const nop = require('gulp-nop');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const watchify = require('watchify');
const browserify = require('browserify');
const babelify = require('babelify');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');
const del = require('del');

const packageJson = require('./package.json');

const nowString = () => new Date().toLocaleTimeString();

const srcPath = (...paths) => path.resolve(__dirname, 'src', ...paths);
const destPath = (...paths) => path.resolve(__dirname, 'dest', ...paths);
const ENTRIES = {
  JS: [srcPath(path.basename(packageJson.main))],
};
const DEST = {
  JS: destPath(''),
};
const ASSETS = {
  JS: destPath('**/*.js'),
};
const flags = {
  production: false,
  watchingJs: false,
};

gulp.task('clean', () => del.sync([destPath('**/*.@(js|map)')]));

gulp.task('enable-production', () => flags.production = true);

gulp.task('enable-wathing-js', () => flags.watchingJs = true);

gulp.task('js', () => {
  const destFileName = path.basename(packageJson.main);

  const bundler = browserify({
    entries: ENTRIES.JS,
    debug: flags.production ? false : true,
    plugin: flags.watchingJs ? watchify : null,
  }).transform(babelify, {
    presets: ['es2015', 'es2016', 'es2017'],
    plugins: [['transform-runtime', {
      helpers: false,
      polyfill: false,
      regenerator: true,
      moduleName: 'babel-runtime'
    }]],
  });

  const bundle = () => bundler.bundle()
    .on('error', (error) => {
      console.log(`[${nowString()}] js bundle error`);
      console.log(error.toString());
    })
    .pipe(source(destFileName))
    .pipe(plumber())
    .pipe(buffer())
    .pipe(flags.production ? nop() : sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(flags.production ? nop() : sourcemaps.write('./'))
    .pipe(gulp.dest(DEST.JS))
    .on('end', () => console.log(`[${nowString()}] write to '${destFileName}'`));

  bundler.on('update', bundle);

  return bundle();
});

gulp.task('default', ['clean', 'js']);

// gulp.task('production', ['enable-production', 'default']);

gulp.task('watch', ['enable-wathing-js', 'default']);
