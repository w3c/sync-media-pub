const { parallel, src, dest } = require('gulp');
var prettyHtml = require('gulp-pretty-html');

function html() {
    return src('../docs/new/**/*.html', { base: './' })
        .pipe(prettyHtml({
            preserve_newlines: false
        }))
        .pipe(dest('./'));
}

exports.default = html;