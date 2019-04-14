var { task, watch, series, parallel } = require('gulp');
// this will automatically register to gulp tasks: ln:bundle, ln:minify and returns them as gulp.series( 'ln:bundle', 'ln:minify' )
var bundle = require('@lernetz/gulp-typescript-bundle');
var exec = require('child_process').exec;

task('bundle-block-crawler', bundle({
    dest: 'dist/mphfe/assets',
    src: 'src/assets/block-crawler.ts',
    name: 'block-crawler',
    rollup: {
        outputOptions: {
            sourcemap: true,
            minify: false,
            extend: true
        }
    }
}));

task('bundle-dasboard-controller', bundle({
    dest: 'dist/mphfe/scripts',
    src: 'src/app/dashboard/dashboard-controller.ts',
    name: 'dashboard-controller',
    rollup: {
        outputOptions: {
            sourcemap: true,
            minify: false,
            extend: true
        }
    }
}));

task('watch', function () {
    watch(['src/**/*.ts', 'src/**/*.html', 'src/**/*.scss', 'src/**/*.js'], series(['bundle-all']));
});

task('bundle-all', series(['bundle-block-crawler', 'bundle-dasboard-controller']));

task('default', series(['bundle-all', 'watch']));

// TODO remove unnecesary ts files from assets. Then dont heed to be put in assets in source code anymore.
// They might be in every other folder.
// Minify...