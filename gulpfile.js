const { src, dest, watch, parallel, series } = require("gulp");
const sass = require('gulp-sass')(require('sass'));

function generateCSS(cb) {
    src('./src/css/styles.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(dest('lib/public/css'));
    cb();
}

function watchFiles(cb) {
    watch('src/css/**/*.scss', generateCSS);
}

exports.css = generateCSS;
exports.watch = watchFiles;

exports.default = series(generateCSS,watchFiles);
