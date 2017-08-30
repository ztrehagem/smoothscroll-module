const path = require('path');
const fs = require('fs');
const gulp = require('gulp');
const babel = require('gulp-babel');
const plumber = require('gulp-plumber');
const del = require('del');

const nowString = () => new Date().toLocaleTimeString();

const srcPath = (...paths) => path.resolve(__dirname, 'src', ...paths);
const destPath = (...paths) => path.resolve(__dirname, 'dest', ...paths);

const ENTRIES = {
  JS: [srcPath('**/*.js')],
};
const WATCH = {
  JS: [srcPath('**/*.js')],
};
const DEST = {
  JS: destPath(''),
};

gulp.task('clean', () => del.sync([destPath('**/*.@(js|map)')]));

gulp.task('js', () => gulp.src(ENTRIES.JS)
  .pipe(plumber())
  .pipe(babel({presets: ['es2015', 'es2016', 'es2017']}))
  .pipe(gulp.dest(DEST.JS))
);

gulp.task('default', ['clean', 'js']);

gulp.task('watch', ['default'], () => {
  gulp.watch(WATCH.JS, ['js']);
});
